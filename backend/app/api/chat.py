from fastapi import APIRouter, Depends
from app.core.dependencies import get_rag_service
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag import RagService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def chat_answer(
    request: ChatRequest,
    rag_service: RagService = Depends(get_rag_service)
) -> ChatResponse:
    return rag_service.answer(
        message=request.message,
        document_ids=request.document_ids
    )
