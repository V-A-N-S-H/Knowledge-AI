import fitz
import pytest
from app.schemas.documents import UploadResponse
from app.services.documents import DocumentService
from app.services.embeddings import FakeEmbeddingService
from app.services.qdrant import FakeVectorStore
from app.services.storage import FakeFileStorage


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Revenue for 2024 was 125 crore.")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_ingest_pdf_stores_page_chunks_with_development_owner(sample_pdf_bytes: bytes) -> None:
    embeddings = FakeEmbeddingService()
    vector_store = FakeVectorStore()
    storage = FakeFileStorage()
    
    doc_service = DocumentService(
        embedding_service=embeddings,
        vector_store=vector_store,
        file_storage=storage,
        owner_id="local-development-owner"
    )

    response = doc_service.ingest_pdf("report.pdf", "application/pdf", sample_pdf_bytes)

    assert isinstance(response, UploadResponse)
    assert response.filename == "report.pdf"
    assert response.chunk_count == 1
    assert response.status == "ready"
    assert len(vector_store.chunks) == 1
    assert vector_store.chunks[0].user_id == "local-development-owner"
    assert vector_store.chunks[0].filename == "report.pdf"
