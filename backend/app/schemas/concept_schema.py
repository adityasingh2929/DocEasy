from pydantic import BaseModel

class ConceptRequest(BaseModel):
    topic: str

class ConceptResponse(BaseModel):
    explanation: str
