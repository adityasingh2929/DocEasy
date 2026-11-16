from pydantic import BaseModel

class DocumentationSource(BaseModel):
    title: str
    url: str
    kind: str = 'topic reference'
    chunkId: str | None = None
