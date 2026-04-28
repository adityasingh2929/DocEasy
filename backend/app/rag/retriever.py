# app/rag/retriever.py

import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHUNKS_PATH = os.path.join(BASE_DIR, "data", "chunks.json")

# load chunks only (lightweight)
with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)


def retrieve_chunks(query_embedding, topic=None, top_k=2):
    """
    Lightweight retriever:
    - NO embeddings
    - topic-based filtering
    """

    if topic:
        filtered = [item for item in data if item["topic"] == topic]
    else:
        filtered = data

    if not filtered:
        filtered = data

    # just return first few chunks
    return [
        {
            "text": item["text"],
            "topic": item["topic"],
            "score": 1.0
        }
        for item in filtered[:top_k]
    ]