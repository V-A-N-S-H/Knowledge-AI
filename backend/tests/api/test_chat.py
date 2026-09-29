from fastapi.testclient import TestClient


def test_chat_endpoint_returns_fallback_when_no_documents_indexed(client: TestClient) -> None:
    response = client.post(
        "/chat",
        json={"message": "What is the revenue?", "document_ids": []}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "fallback"
    assert data["notice"] == "This information was not found in your uploaded data."
    assert data["sources"] == []
    assert "answer" in data


def test_chat_endpoint_rejects_empty_message(client: TestClient) -> None:
    response = client.post(
        "/chat",
        json={"message": "   ", "document_ids": []}
    )
    assert response.status_code == 400
    assert "detail" in response.json()
