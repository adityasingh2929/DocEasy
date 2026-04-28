from fastapi import APIRouter
from app.api.routes import doubt, quiz, challenge

api_router = APIRouter()

api_router.include_router(doubt.router, tags=["Doubt"])
api_router.include_router(quiz.router, tags=["Quiz"])
api_router.include_router(challenge.router, tags=["Challenge"])

