from pydantic import BaseModel
from typing import List


class QuizRequest(BaseModel):
    topic: str


class QuizResponse(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str
    explanation: str
