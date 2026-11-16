from pydantic import BaseModel
from pydantic import Field
from app.schemas.source_schema import DocumentationSource


class ChallengeRequest(BaseModel):
    topic: str


class ChallengeResponse(BaseModel):
    question: str
    code: str
    correctAnswer: str
    explanation: str
    sources: list[DocumentationSource] = Field(default_factory=list)
    origin: str = 'ai'
