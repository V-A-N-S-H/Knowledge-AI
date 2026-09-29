import fitz
import pytest
from app.core.config import get_settings
from app.services.documents import DocumentService
from app.services.embeddings import GeminiEmbeddingService
from app.services.generation import GeminiGenerationService
from app.services.qdrant import QdrantVectorStore
from app.services.rag import RagService
from app.services.retrieval import RetrievalService
from app.services.storage import FakeFileStorage


@pytest.mark.integration
def test_live_gemini_and_qdrant_rag_flow() -> None:
    settings = get_settings()
    if not settings.gemini_api_key:
        pytest.skip("Gemini API Key is missing")

    # 1. Initialize real live services
    embeddings = GeminiEmbeddingService(api_key=settings.gemini_api_key)
    generation = GeminiGenerationService(api_key=settings.gemini_api_key)
    vector_store = QdrantVectorStore(url=":memory:")
    storage = FakeFileStorage()

    doc_service = DocumentService(
        embedding_service=embeddings,
        vector_store=vector_store,
        file_storage=storage
    )

    # 2. Create sample PDF
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "The company generated revenue of 125 crore in financial year 2024.")
    pdf_bytes = doc.tobytes()
    doc.close()

    # 3. Ingest PDF
    upload_res = doc_service.ingest_pdf("annual_report.pdf", "application/pdf", pdf_bytes)
    assert upload_res.status == "ready"
    assert upload_res.chunk_count > 0

    # 4. RAG Chat
    retrieval = RetrievalService(embedding_service=embeddings, vector_store=vector_store)
    from app.services.answerability import AnswerabilityService
    answerability = AnswerabilityService(generation_service=generation)
    rag = RagService(retrieval_service=retrieval, answerability_service=answerability, generation_service=generation)

    # Query 1: Supported question
    supported_res = rag.answer("What was the revenue in financial year 2024?", [upload_res.document_id])
    assert supported_res.mode == "document"
    assert "125" in supported_res.answer or "crore" in supported_res.answer
    assert len(supported_res.sources) > 0
    assert supported_res.sources[0].filename == "annual_report.pdf"

    # Query 2: Unsupported question
    unsupported_res = rag.answer("Who is the Prime Minister of Canada?", [upload_res.document_id])
    assert unsupported_res.mode == "fallback"
    assert unsupported_res.notice == "This information was not found in your uploaded data."
