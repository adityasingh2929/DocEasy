from fastapi import APIRouter
from app.api.routes import doubt, quiz, challenge
from app.api.routes import practice

api_router = APIRouter()

api_router.include_router(doubt.router, tags=["Doubt"])
api_router.include_router(quiz.router, tags=["Quiz"])
api_router.include_router(challenge.router, tags=["Challenge"])
api_router.include_router(practice.router, tags=["Practice and assessments"])

