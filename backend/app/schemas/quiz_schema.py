from pydantic import BaseModel
from typing import List
from pydantic import Field
from app.schemas.source_schema import DocumentationSource


class QuizRequest(BaseModel):
    topic: str


class QuizResponse(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str
    explanation: str
    sources: List[DocumentationSource] = Field(default_factory=list)
    origin: str = 'ai'
