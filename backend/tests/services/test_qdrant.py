from app.services.embeddings import StoredChunk
from app.services.qdrant import FakeVectorStore


def test_search_filters_by_user_id_and_document_ids() -> None:
    store = FakeVectorStore()
    chunk1 = StoredChunk(
        text="User 1 Doc 1 content",
        filename="d1.pdf",
        page=1,
        chunk_id="c1",
        file_type="pdf",
        user_id="user1",
        document_id="doc1"
    )
    chunk2 = StoredChunk(
        text="User 2 Doc 2 content",
        filename="d2.pdf",
        page=1,
        chunk_id="c2",
        file_type="pdf",
        user_id="user2",
        document_id="doc2"
    )

    store.upsert([chunk1, chunk2], [[0.1] * 768, [0.2] * 768])

    # Search user1 doc1
    results = store.search([0.1] * 768, user_id="user1", document_ids=["doc1"], limit=5)
    assert len(results) == 1
    assert results[0].user_id == "user1"
    assert results[0].document_id == "doc1"

    # Search user2 doc1 (does not match user2)
    results2 = store.search([0.1] * 768, user_id="user2", document_ids=["doc1"], limit=5)
    assert len(results2) == 0
