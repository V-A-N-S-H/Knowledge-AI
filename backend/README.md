# KnowledgeAI Backend

FastAPI backend service for KnowledgeAI - Multimodal RAG Knowledge Assistant.

## Requirements

- Python 3.10+
- Dependencies listed in `pyproject.toml`

## Local Development

```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Start development server
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health` - API Health check
- `POST /documents/upload` - Index PDF document
- `POST /chat` - Grounded RAG or general knowledge fallback answer
