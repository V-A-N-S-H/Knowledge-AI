from app.services.embeddings import RetrievedChunk
from app.services.generation import GenerationService


class AnswerabilityService:
    def __init__(self, generation_service: GenerationService):
        self.generation_service = generation_service

    def is_supported(self, question: str, evidence: list[RetrievedChunk]) -> bool:
        if not evidence:
            return False
        return self.generation_service.classify_support(question, evidence)
