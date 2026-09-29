from app.services.embeddings import FakeEmbeddingService


def test_fake_embedding_service_returns_expected_vector_dimensions() -> None:
    service = FakeEmbeddingService(dimension=768)
    
    doc_vectors = service.embed_documents(["chunk one", "chunk two"])
    assert len(doc_vectors) == 2
    assert len(doc_vectors[0]) == 768
    assert len(doc_vectors[1]) == 768

    query_vector = service.embed_query("What is the revenue?")
    assert len(query_vector) == 768
