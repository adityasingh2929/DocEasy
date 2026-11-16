from typing import Annotated
from fastapi import APIRouter
from pydantic import BaseModel, Field, StringConstraints
from app.services.practice_service import create_assessment, submit_assessment, reviewed_challenge, references

router = APIRouter()
Topic = Annotated[str, StringConstraints(min_length=1, max_length=80)]

class AssessmentRequest(BaseModel):
    topic: Topic

class AssessmentAnswer(BaseModel):
    questionId: str = Field(min_length=1, max_length=100)
    answer: str = Field(min_length=1, max_length=5000)

class AssessmentSubmission(BaseModel):
    answers: list[AssessmentAnswer] = Field(min_length=5, max_length=5)

@router.post('/assessments')
def start(request: AssessmentRequest):
    return create_assessment(request.topic)

@router.post('/assessments/{session_id}/submit')
def submit(session_id: str, request: AssessmentSubmission):
    return submit_assessment(session_id, request.answers)

@router.get('/practice/{topic}/challenge')
def challenge(topic: str):
    return reviewed_challenge(topic)

@router.get('/sources/{topic}')
def sources(topic: str):
    return {'topic': topic, 'sources': references(topic)}
