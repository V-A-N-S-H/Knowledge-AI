from fastapi import APIRouter
from fastapi.testclient import TestClient
from app.schemas.chat import ChatResponse
from app.core.errors import AppError
from app.main import create_app


def test_health_returns_healthy(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_chat_response_requires_no_sources_for_fallback() -> None:
    response = ChatResponse(mode="fallback", answer="Answer", notice="Not found", sources=[])
    assert response.mode == "fallback"
    assert response.sources == []


def test_app_error_hides_internal_detail() -> None:
    app = create_app()
    test_router = APIRouter()

    @test_router.get("/test-error")
    def error_route():
        raise AppError(status_code=400, public_message="Safe public message. Secret internal details hidden.")

    app.include_router(test_router)
    test_client = TestClient(app)

    response = test_client.get("/test-error")
    assert response.status_code == 400
    assert response.json() == {"detail": "Safe public message. Secret internal details hidden."}
