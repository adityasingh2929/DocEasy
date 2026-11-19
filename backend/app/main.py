from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import os
from app.services.document_service import purge

from app.api.router import api_router

@asynccontextmanager
async def lifespan(app):
    async def cleanup():
        while True:
            purge()
            await asyncio.sleep(30)
    task = asyncio.create_task(cleanup())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="Docs Made Easy API", lifespan=lifespan)

# CORS (frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', 'https://doc-easy-alpha.vercel.app,http://127.0.0.1:5175,http://localhost:5175,http://127.0.0.1:5173,http://localhost:5173').split(','),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Retry-After"],
)

# include all routes
app.include_router(api_router)


@app.get("/")
def root():
    return {"service": "DocEasy", "status": "ok", "version": "1.0.0"}

@app.get('/health')
def health():
    from app.api.routes.auth import database
    with database() as db:
        db.execute('SELECT 1').fetchone()
    return {'status': 'ok', 'accounts': 'ready'}
