from typing import Any, Dict
from fastapi import APIRouter, Depends, Body
from app.core.dependencies import get_rag_service
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import RagService
from app.services.chat_sessions import ChatSessionRegistry

router = APIRouter(prefix="/chat", tags=["Chat"])
session_registry = ChatSessionRegistry()


@router.post("", response_model=ChatResponse)
def chat_answer(
    request: ChatRequest,
    rag_service: RagService = Depends(get_rag_service)
) -> ChatResponse:
    return rag_service.answer(
        message=request.message,
        document_ids=request.document_ids
    )


@router.get("/sessions")
def get_chat_sessions() -> Dict[str, Any]:
    return session_registry.get_all_sessions()


@router.post("/sessions/{doc_id}")
def save_chat_session(doc_id: str, session: Dict[str, Any] = Body(...)) -> Dict[str, str]:
    session_registry.save_session(doc_id, session)
    return {"status": "saved", "doc_id": doc_id}


@router.delete("/sessions/{doc_id}")
def delete_chat_session(doc_id: str) -> Dict[str, str]:
    session_registry.delete_session(doc_id)
    return {"status": "deleted", "doc_id": doc_id}
