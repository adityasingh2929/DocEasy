# app/rag/embedder.py

# ❌ REMOVE SentenceTransformer completely

def embed_query(text: str):
    """
    Lightweight fake embedding for demo.
    Avoids loading heavy ML models on Render.
    """
    # simple hash-based embedding
    return [float(ord(c)) for c in text[:50]]