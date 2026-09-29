import os

# Ensure tests default to environment="test" before importing app settings
os.environ["ENVIRONMENT"] = "test"

import pytest
from fastapi.testclient import TestClient
from app.core.config import get_settings
from app.main import create_app


@pytest.fixture(autouse=True)
def reset_settings_cache():
    get_settings.cache_clear()


@pytest.fixture
def client() -> TestClient:
    app = create_app()
    return TestClient(app)
