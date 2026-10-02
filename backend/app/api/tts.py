from fastapi import APIRouter, Depends, Response
from app.core.dependencies import get_tts_service
from app.schemas.tts import TTSRequest
from app.services.tts import TTSService

router = APIRouter(prefix="/tts", tags=["TTS"])


@router.post("")
def generate_tts(
    request: TTSRequest,
    tts_service: TTSService = Depends(get_tts_service)
) -> Response:
    audio_bytes, media_type = tts_service.synthesize(
        text=request.text,
        text_language=request.text_language or "auto"
    )
    return Response(content=audio_bytes, media_type=media_type)
