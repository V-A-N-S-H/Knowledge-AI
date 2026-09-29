from typing import Protocol
from pydantic import BaseModel
from app.core.errors import AppError


class StoredChunk(BaseModel):
    text: str
    filename: str
    page: int
    chunk_id: str
    file_type: str = "pdf"
    user_id: str
    document_id: str


class RetrievedChunk(BaseModel):
    text: str
    filename: str
    page: int
    chunk_id: str
    file_type: str = "pdf"
    user_id: str
    document_id: str
    score: float


class EmbeddingService(Protocol):
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        ...

    def embed_query(self, text: str) -> list[float]:
        ...


class FakeEmbeddingService:
    def __init__(self, dimension: int = 768):
        self.dimension = dimension

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.1] * self.dimension for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.1] * self.dimension


class GeminiEmbeddingService:
    def __init__(self, api_key: str, model_name: str = "gemini-embedding-001"):
        self.api_key = api_key
        self.model_name = model_name
        self._client = None

    def _get_client(self):
        if not self.api_key:
            raise AppError(status_code=500, public_message="Gemini API key is not configured.")
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            client = self._get_client()
            response = client.models.embed_content(
                model=self.model_name,
                contents=texts
            )
            return [e.values for e in response.embeddings]
        except Exception as e:
            raise AppError(status_code=502, public_message="Failed to generate document embeddings from provider.")

    def embed_query(self, text: str) -> list[float]:
        try:
            client = self._get_client()
            response = client.models.embed_content(
                model=self.model_name,
                contents=text
            )
            return response.embeddings[0].values
        except Exception as e:
            raise AppError(status_code=502, public_message="Failed to generate query embedding from provider.")
