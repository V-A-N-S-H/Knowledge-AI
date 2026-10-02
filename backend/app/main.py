from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.health import router as health_router
from app.api.tts import router as tts_router
from app.core.errors import AppError, app_error_handler


from fastapi.middleware.cors import CORSMiddleware


def create_app() -> FastAPI:
    app = FastAPI(
        title="KnowledgeAI RAG API",
        version="0.1.0",
        description="Multimodal Knowledge RAG Platform API"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_exception_handler(AppError, app_error_handler)
    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(documents_router)
    app.include_router(chat_router)
    app.include_router(tts_router)
    
    return app




app = create_app()
