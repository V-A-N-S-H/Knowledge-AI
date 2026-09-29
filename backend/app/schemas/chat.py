from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.common import SourceCitation

ChatMode = Literal["document", "fallback"]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    document_ids: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    mode: ChatMode
    answer: str
    notice: str | None = None
    sources: list[SourceCitation] = Field(default_factory=list)
