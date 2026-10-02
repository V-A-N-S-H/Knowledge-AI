from typing import Any, Dict
from fastapi import APIRouter, Depends, Body, Header, Query
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
def get_chat_sessions(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    user_id: str | None = Query(default=None),
) -> Dict[str, Any]:
    target_user_id = x_user_id or user_id or "dev_user_001"
    return session_registry.get_user_sessions(target_user_id)


@router.post("/sessions/{doc_id}")
def save_chat_session(
    doc_id: str,
    session: Dict[str, Any] = Body(...),
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    user_id: str | None = Query(default=None),
) -> Dict[str, str]:
    target_user_id = x_user_id or user_id or "dev_user_001"
    session_registry.save_session(target_user_id, doc_id, session)
    return {"status": "saved", "doc_id": doc_id}


@router.delete("/sessions/{doc_id}")
def delete_chat_session(
    doc_id: str,
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    user_id: str | None = Query(default=None),
) -> Dict[str, str]:
    target_user_id = x_user_id or user_id or "dev_user_001"
    session_registry.delete_session(target_user_id, doc_id)
    return {"status": "deleted", "doc_id": doc_id}
