from app.schemas.chat import ChatResponse
from app.schemas.common import SourceCitation
from app.services.answerability import AnswerabilityService
from app.services.generation import GenerationService
from app.services.retrieval import RetrievalService


class RagService:
    def __init__(
        self,
        retrieval_service: RetrievalService,
        answerability_service: AnswerabilityService,
        generation_service: GenerationService
    ):
        self.retrieval_service = retrieval_service
        self.answerability_service = answerability_service
        self.generation_service = generation_service

    def answer(self, message: str, document_ids: list[str]) -> ChatResponse:
        # 1. Retrieve candidate evidence chunks
        evidence = self.retrieval_service.retrieve(message, document_ids)

        # 2. Perform evidence answerability check
        is_supported = self.answerability_service.is_supported(message, evidence)

        # 3. Mode decision
        if is_supported and evidence:
            answer_text = self.generation_service.answer_from_evidence(message, evidence)
            
            # Extract unique citations
            seen_citations = set()
            sources: list[SourceCitation] = []
            for chunk in evidence:
                citation_key = (chunk.filename, chunk.page)
                if citation_key not in seen_citations:
                    seen_citations.add(citation_key)
                    sources.append(SourceCitation(filename=chunk.filename, page=chunk.page))

            return ChatResponse(
                mode="document",
                answer=answer_text,
                notice=None,
                sources=sources
            )

        # 4. Fallback mode / General AI mode
        fallback_answer = self.generation_service.answer_from_general_knowledge(message)
        return ChatResponse(
            mode="fallback",
            answer=fallback_answer,
            notice="This information was not found in your uploaded data.",
            sources=[]
        )
