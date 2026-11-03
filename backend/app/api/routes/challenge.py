from fastapi import APIRouter, HTTPException
from app.schemas.challenge_schema import ChallengeRequest, ChallengeResponse
from app.services.challenge_service import generate_challenge

router = APIRouter()


@router.post("/challenge", response_model=ChallengeResponse)
def create_challenge(request: ChallengeRequest) -> ChallengeResponse:
    try:
        return generate_challenge(request.topic)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Generation failed. Please try again.")
