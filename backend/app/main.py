from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router

app = FastAPI(title="Docs Made Easy API")

# CORS (frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include all routes
app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}


print("🚀 FastAPI app starting...")