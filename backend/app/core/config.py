from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "development"
    development_owner_id: str = "local-development-owner"
    max_upload_bytes: int = 10_000_000  # 10 MB limit
    
    gemini_api_key: str = ""
    gemini_embedding_model: str = "gemini-embedding-001"
    gemini_llm_model: str = "gemini-3.5-flash-lite"
    
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection_name: str = "knowledge_base"
    
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_storage_bucket: str = "documents"

    gpt_sovits_url: str = "http://localhost:9880"
    gpt_sovits_text_language: str = "auto"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
