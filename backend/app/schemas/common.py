from pydantic import BaseModel


class SourceCitation(BaseModel):
    filename: str
    page: int
