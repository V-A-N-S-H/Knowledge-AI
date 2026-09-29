from app.schemas.chat import ChatResponse
from app.services.answerability import AnswerabilityService
from app.services.embeddings import FakeEmbeddingService, StoredChunk
from app.services.generation import FakeGenerationService
from app.services.qdrant import FakeVectorStore
from app.services.rag import RagService
from app.services.retrieval import RetrievalService


def test_rag_service_returns_document_mode_with_sources() -> None:
    embeddings = FakeEmbeddingService()
    vector_store = FakeVectorStore()
    generation = FakeGenerationService(should_support=True)
    
    vector_store.upsert(
        [
            StoredChunk(
                text="Revenue for 2024 was 125 crore.",
                filename="report.pdf",
                page=32,
                chunk_id="c1",
                file_type="pdf",
                user_id="local-owner",
                document_id="doc1"
            )
        ],
        [[0.1] * 768]
    )

    retrieval = RetrievalService(embedding_service=embeddings, vector_store=vector_store, owner_id="local-owner")
    answerability = AnswerabilityService(generation_service=generation)
    rag = RagService(retrieval_service=retrieval, answerability_service=answerability, generation_service=generation)

    response = rag.answer("What was the revenue in 2024?", ["doc1"])
    assert response.mode == "document"
    assert "125 crore" in response.answer
    assert response.notice is None
    assert len(response.sources) == 1
    assert response.sources[0].filename == "report.pdf"
    assert response.sources[0].page == 32


def test_rag_service_returns_fallback_mode_when_unsupported() -> None:
    embeddings = FakeEmbeddingService()
    vector_store = FakeVectorStore()
    generation = FakeGenerationService(should_support=False)
    
    retrieval = RetrievalService(embedding_service=embeddings, vector_store=vector_store, owner_id="local-owner")
    answerability = AnswerabilityService(generation_service=generation)
    rag = RagService(retrieval_service=retrieval, answerability_service=answerability, generation_service=generation)

    response = rag.answer("Who is the CEO of Microsoft?", ["doc1"])
    assert response.mode == "fallback"
    assert response.notice == "This information was not found in your uploaded data."
    assert response.sources == []
    assert "General knowledge" in response.answer
