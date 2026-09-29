from app.services.answerability import AnswerabilityService
from app.services.embeddings import RetrievedChunk
from app.services.generation import FakeGenerationService


def test_answerability_service_evaluates_evidence() -> None:
    generation = FakeGenerationService(should_support=True)
    service = AnswerabilityService(generation_service=generation)

    chunk = RetrievedChunk(
        text="Revenue was 125 crore.",
        filename="r.pdf",
        page=1,
        chunk_id="c1",
        file_type="pdf",
        user_id="u1",
        document_id="d1",
        score=0.9
    )

    assert service.is_supported("What is revenue?", [chunk]) is True
    assert service.is_supported("What is revenue?", []) is False
