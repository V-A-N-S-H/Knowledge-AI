from app.core.config import get_settings
from app.services.answerability import AnswerabilityService
from app.services.documents import DocumentService, DocumentRegistry
from app.services.embeddings import EmbeddingService, FakeEmbeddingService, GeminiEmbeddingService
from app.services.generation import GenerationService, FakeGenerationService, GeminiGenerationService
from app.services.qdrant import VectorStore, FakeVectorStore, QdrantVectorStore
from app.services.rag import RagService
from app.services.retrieval import RetrievalService
from app.services.storage import FileStorage, FakeFileStorage, LocalFileStorage, SupabaseFileStorage
from app.services.tts import TTSService, FakeTTSService, GptSovitsTTSService


_fake_vector_store = FakeVectorStore()
_fake_file_storage = FakeFileStorage()
_qdrant_vector_store: QdrantVectorStore | None = None
_file_storage: FileStorage | None = None
_document_registry: DocumentRegistry | None = None


def get_embedding_service() -> EmbeddingService:
    settings = get_settings()
    if settings.environment == "test" or not settings.gemini_api_key:
        return FakeEmbeddingService()
    return GeminiEmbeddingService(
        api_key=settings.gemini_api_key,
        model_name=settings.gemini_embedding_model
    )


def get_vector_store() -> VectorStore:
    global _qdrant_vector_store
    settings = get_settings()
    if settings.environment == "test" or not settings.qdrant_url:
        return _fake_vector_store
    if _qdrant_vector_store is None:
        _qdrant_vector_store = QdrantVectorStore(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
            collection_name=settings.qdrant_collection_name
        )
    return _qdrant_vector_store


def get_file_storage() -> FileStorage:
    global _file_storage
    settings = get_settings()
    if settings.environment == "test":
        return _fake_file_storage
    if _file_storage is None:
        if settings.supabase_url and settings.supabase_key:
            _file_storage = SupabaseFileStorage(
                url=settings.supabase_url,
                key=settings.supabase_key,
                bucket=settings.supabase_storage_bucket,
                fallback_storage=LocalFileStorage(upload_dir="data/uploads")
            )
        else:
            _file_storage = LocalFileStorage(upload_dir="data/uploads")
    return _file_storage


def get_document_registry() -> DocumentRegistry:
    global _document_registry
    settings = get_settings()
    if settings.environment == "test":
        return DocumentRegistry(registry_file="data/test_registry.json")
    if _document_registry is None:
        _document_registry = DocumentRegistry(registry_file="data/documents_registry.json")
    return _document_registry


def get_generation_service() -> GenerationService:
    settings = get_settings()
    if settings.environment == "test" or not settings.gemini_api_key:
        return FakeGenerationService()
    return GeminiGenerationService(
        api_key=settings.gemini_api_key,
        model_name=settings.gemini_llm_model
    )


def get_document_service() -> DocumentService:
    return DocumentService(
        embedding_service=get_embedding_service(),
        vector_store=get_vector_store(),
        file_storage=get_file_storage(),
        registry=get_document_registry()
    )


def get_retrieval_service() -> RetrievalService:
    return RetrievalService(
        embedding_service=get_embedding_service(),
        vector_store=get_vector_store()
    )


def get_answerability_service() -> AnswerabilityService:
    return AnswerabilityService(
        generation_service=get_generation_service()
    )


def get_rag_service() -> RagService:
    return RagService(
        retrieval_service=get_retrieval_service(),
        answerability_service=get_answerability_service(),
        generation_service=get_generation_service()
    )


def get_tts_service() -> TTSService:
    settings = get_settings()
    if settings.environment == "test":
        return FakeTTSService()
    return GptSovitsTTSService(
        base_url=settings.gpt_sovits_url,
        default_language=settings.gpt_sovits_text_language
    )

