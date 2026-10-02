import re
import httpx
from abc import ABC, abstractmethod
from app.core.errors import AppError


class TTSService(ABC):
    @abstractmethod
    def synthesize(self, text: str, text_language: str = "auto") -> tuple[bytes, str]:
        """Synthesize text to speech returning (audio_bytes, media_type)"""
        pass


def clean_text_for_speech(text: str) -> str:
    # Remove markdown code blocks
    text = re.sub(r"```[\s\S]*?```", " [code block omitted] ", text)
    # Remove inline code
    text = re.sub(r"`([^`]+)`", r"\1", text)
    # Remove markdown links [text](url) -> text
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    # Remove markdown headers #, ##, etc.
    text = re.sub(r"#{1,6}\s*", "", text)
    # Remove bold/italic *, _
    text = re.sub(r"[*_]{1,3}([^*_]+)[*_]{1,3}", r"\1", text)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Clean multiple spaces and blank lines
    text = re.sub(r"\s+", " ", text).strip()
    return text


class GptSovitsTTSService(TTSService):
    def __init__(self, base_url: str = "http://localhost:9880", default_language: str = "auto"):
        self.base_url = base_url.rstrip("/")
        self.default_language = default_language

    def synthesize(self, text: str, text_language: str = "auto") -> tuple[bytes, str]:
        cleaned = clean_text_for_speech(text)
        if not cleaned:
            raise AppError(
                status_code=400,
                public_message="Text content is empty after processing.",
                internal_detail="Empty text provided for TTS synthesis."
            )

        lang = text_language or self.default_language
        payload = {
            "text": cleaned,
            "text_language": lang,
            "text_lang": lang,
            "media_type": "wav"
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                endpoints = [
                    (f"{self.base_url}/tts", "POST", payload),
                    (f"{self.base_url}/tts", "GET", payload),
                    (f"{self.base_url}/", "POST", payload),
                    (f"{self.base_url}/", "GET", payload),
                ]

                last_error = None
                for url, method, data in endpoints:
                    try:
                        if method == "POST":
                            r = client.post(url, json=data)
                        else:
                            r = client.get(url, params=data)

                        if r.status_code == 200 and len(r.content) > 0:
                            content_type = r.headers.get("content-type", "audio/wav")
                            return r.content, content_type
                        else:
                            last_error = f"Status {r.status_code}: {r.text[:200]}"
                    except httpx.RequestError as exc:
                        last_error = str(exc)
                        continue

                raise AppError(
                    status_code=503,
                    public_message=f"GPT-SoVITS TTS service is unreachable or returned an error. Ensure server is running at {self.base_url}",
                    internal_detail=f"GPT-SoVITS connection failed: {last_error}"
                )

        except AppError:
            raise
        except Exception as err:
            raise AppError(
                status_code=500,
                public_message="An error occurred while generating speech audio.",
                internal_detail=str(err)
            )


class FakeTTSService(TTSService):
    """Fake TTS service for testing and fallback"""
    def synthesize(self, text: str, text_language: str = "auto") -> tuple[bytes, str]:
        cleaned = clean_text_for_speech(text)
        if not cleaned:
            raise AppError(status_code=400, public_message="Text is empty.")
        # Minimal valid 44-byte WAV header + silence
        wav_header = (
            b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
            b"\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
        )
        return wav_header, "audio/wav"
