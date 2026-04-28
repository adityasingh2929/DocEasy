from pydantic import BaseModel


class ChallengeRequest(BaseModel):
    topic: str


class ChallengeResponse(BaseModel):
    question: str
    code: str
    correctAnswer: str
    explanation: str
