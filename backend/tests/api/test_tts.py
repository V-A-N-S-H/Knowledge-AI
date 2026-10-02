from fastapi.testclient import TestClient
from app.main import create_app

client = TestClient(create_app())


def test_tts_endpoint_returns_audio():
    response = client.post(
        "/tts",
        json={"text": "Hello world, testing GPT-SoVITS TTS synthesis."}
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/")
    assert len(response.content) > 0


def test_tts_endpoint_rejects_empty_text():
    response = client.post(
        "/tts",
        json={"text": "   "}
    )
    assert response.status_code == 400
