import pytest
from app.services.tts import clean_text_for_speech, FakeTTSService
from app.core.errors import AppError


def test_clean_text_for_speech():
    markdown = "Hello **world**! Check [this link](https://example.com) and `code`.\n\n# Header\n```python\nprint(1)\n```"
    cleaned = clean_text_for_speech(markdown)
    assert "**" not in cleaned
    assert "https://example.com" not in cleaned
    assert "# Header" not in cleaned
    assert "Hello world! Check this link and code. Header [code block omitted]" in cleaned


def test_fake_tts_service():
    service = FakeTTSService()
    audio_bytes, media_type = service.synthesize("Test speech synthesis")
    assert media_type == "audio/wav"
    assert audio_bytes.startswith(b"RIFF")


def test_fake_tts_service_empty_text():
    service = FakeTTSService()
    with pytest.raises(AppError):
        service.synthesize("   ")
