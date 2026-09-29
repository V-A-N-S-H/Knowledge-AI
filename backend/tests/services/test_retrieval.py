import pytest
from app.core.errors import AppError
from app.services.embeddings import FakeEmbeddingService, StoredChunk
from app.services.qdrant import FakeVectorStore
from app.services.retrieval import RetrievalService


def test_retrieve_uses_configured_owner_and_requested_documents() -> None:
    embeddings = FakeEmbeddingService()
    vector_store = FakeVectorStore()
    
    # Pre-populate store
    chunk1 = StoredChunk(
        text="Revenue is 125 crore",
        filename="r.pdf",
        page=1,
        chunk_id="c1",
        file_type="pdf",
        user_id="local-owner",
        document_id="doc1"
    )
    chunk2 = StoredChunk(
        text="Other owner revenue is 900 crore",
        filename="r2.pdf",
        page=1,
        chunk_id="c2",
        file_type="pdf",
        user_id="other-owner",
        document_id="doc1"
    )
    vector_store.upsert([chunk1, chunk2], [[0.1] * 768, [0.1] * 768])

    service = RetrievalService(
        embedding_service=embeddings,
        vector_store=vector_store,
        owner_id="local-owner"
    )

    results = service.retrieve("What is revenue?", ["doc1"])
    assert len(results) == 1
    assert results[0].user_id == "local-owner"
    assert results[0].text == "Revenue is 125 crore"


def test_retrieve_rejects_empty_question() -> None:
    service = RetrievalService(
        embedding_service=FakeEmbeddingService(),
        vector_store=FakeVectorStore(),
        owner_id="local-owner"
    )
    with pytest.raises(AppError) as exc_info:
        service.retrieve("   ", ["doc1"])
    assert exc_info.value.status_code == 400
