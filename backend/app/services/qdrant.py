import uuid
from typing import Protocol
from app.core.errors import AppError
from app.services.embeddings import StoredChunk, RetrievedChunk


class VectorStore(Protocol):
    def upsert(self, chunks: list[StoredChunk], embeddings: list[list[float]]) -> None:
        ...

    def search(
        self,
        query_vector: list[float],
        user_id: str,
        document_ids: list[str],
        limit: int = 5
    ) -> list[RetrievedChunk]:
        ...

    def delete_document(self, document_id: str) -> None:
        ...


class FakeVectorStore:
    def __init__(self):
        self.chunks: list[StoredChunk] = []
        self.embeddings: list[list[float]] = []

    def upsert(self, chunks: list[StoredChunk], embeddings: list[list[float]]) -> None:
        self.chunks.extend(chunks)
        self.embeddings.extend(embeddings)

    def search(
        self,
        query_vector: list[float],
        user_id: str,
        document_ids: list[str],
        limit: int = 5
    ) -> list[RetrievedChunk]:
        results: list[RetrievedChunk] = []
        for chunk in self.chunks:
            if chunk.user_id == user_id and (not document_ids or chunk.document_id in document_ids):
                results.append(
                    RetrievedChunk(
                        text=chunk.text,
                        filename=chunk.filename,
                        page=chunk.page,
                        chunk_id=chunk.chunk_id,
                        file_type=chunk.file_type,
                        user_id=chunk.user_id,
                        document_id=chunk.document_id,
                        score=0.9
                    )
                )
        return results[:limit]

    def delete_document(self, document_id: str) -> None:
        new_chunks = []
        new_embeddings = []
        for c, emb in zip(self.chunks, self.embeddings):
            if c.document_id != document_id:
                new_chunks.append(c)
                new_embeddings.append(emb)
        self.chunks = new_chunks
        self.embeddings = new_embeddings


class QdrantVectorStore:
    def __init__(self, url: str, api_key: str = "", collection_name: str = "knowledge_base"):
        self.url = url
        self.api_key = api_key
        self.collection_name = collection_name
        self._client = None

    def _get_client(self):
        if self._client is None:
            from qdrant_client import QdrantClient
            if self.url == ":memory:":
                self._client = QdrantClient(":memory:")
            elif self.url.startswith("data/") or self.url.startswith("./data"):
                self._client = QdrantClient(path=self.url)
            else:
                try:
                    self._client = QdrantClient(url=self.url, api_key=self.api_key or None)
                except Exception:
                    self._client = QdrantClient(path="data/qdrant")
        return self._client

    def _ensure_collection(self, vector_dim: int) -> None:
        client = self._get_client()
        from qdrant_client.models import VectorParams, Distance
        if not client.collection_exists(self.collection_name):
            client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=vector_dim, distance=Distance.COSINE)
            )

    def upsert(self, chunks: list[StoredChunk], embeddings: list[list[float]]) -> None:
        if not chunks or not embeddings:
            return
        try:
            client = self._get_client()
            vector_dim = len(embeddings[0])
            self._ensure_collection(vector_dim)

            from qdrant_client.models import PointStruct

            points = []
            for chunk, vector in zip(chunks, embeddings):
                point_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.chunk_id))
                points.append(
                    PointStruct(
                        id=point_uuid,
                        vector=vector,
                        payload=chunk.model_dump()
                    )
                )
            client.upsert(collection_name=self.collection_name, points=points)
        except Exception as e:
            raise AppError(status_code=502, public_message=f"Failed to index document vectors in vector database: {str(e)}")

    def search(
        self,
        query_vector: list[float],
        user_id: str,
        document_ids: list[str],
        limit: int = 5
    ) -> list[RetrievedChunk]:
        try:
            client = self._get_client()
            if not client.collection_exists(self.collection_name):
                return []

            from qdrant_client.models import Filter, FieldCondition, MatchValue, MatchAny

            must_conditions = [FieldCondition(key="user_id", match=MatchValue(value=user_id))]
            if document_ids:
                must_conditions.append(FieldCondition(key="document_id", match=MatchAny(any=document_ids)))

            query_filter = Filter(must=must_conditions)
            query_res = client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                query_filter=query_filter,
                limit=limit
            )
            search_res = query_res.points

            retrieved: list[RetrievedChunk] = []
            for hit in search_res:
                payload = hit.payload
                retrieved.append(
                    RetrievedChunk(
                        text=payload["text"],
                        filename=payload["filename"],
                        page=payload["page"],
                        chunk_id=payload["chunk_id"],
                        file_type=payload.get("file_type", "pdf"),
                        user_id=payload["user_id"],
                        document_id=payload["document_id"],
                        score=hit.score
                    )
                )
            return retrieved
        except Exception as e:
            raise AppError(status_code=502, public_message=f"Failed to retrieve document vectors from database: {str(e)}")

    def delete_document(self, document_id: str) -> None:
        try:
            client = self._get_client()
            if not client.collection_exists(self.collection_name):
                return
            from qdrant_client.models import Filter, FieldCondition, MatchValue
            query_filter = Filter(must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))])
            client.delete(collection_name=self.collection_name, points_selector=query_filter)
        except Exception:
            pass
