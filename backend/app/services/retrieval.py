from app.core.config import get_settings
from app.core.errors import AppError
from app.services.embeddings import EmbeddingService, RetrievedChunk
from app.services.qdrant import VectorStore


class RetrievalService:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        vector_store: VectorStore,
        owner_id: str | None = None
    ):
        settings = get_settings()
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.owner_id = owner_id or settings.development_owner_id

    def retrieve(
        self,
        question: str,
        document_ids: list[str],
        limit: int = 5
    ) -> list[RetrievedChunk]:
        stripped = question.strip()
        if not stripped:
            raise AppError(status_code=400, public_message="Question message cannot be empty.")

        if not document_ids:
            return []

        query_vector = self.embedding_service.embed_query(stripped)
        return self.vector_store.search(
            query_vector=query_vector,
            user_id=self.owner_id,
            document_ids=document_ids,
            limit=limit
        )
