import json
import joblib
import os
from sentence_transformers import SentenceTransformer

# Resolve the absolute path to the backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHUNKS_PATH = os.path.join(BASE_DIR, "data", "chunks.json")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "embeddings.joblib")

# Load model once
model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embeddings():
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    embedded_data = []

    for i, chunk in enumerate(chunks):
        print(f"[{i+1}/{len(chunks)}] Embedding: {chunk['text'][:60]}...")

        # 🔥 direct encoding (optimized)
        embedding = model.encode(chunk["text"]).tolist()

        embedded_data.append({
            "topic": chunk["topic"],
            "text": chunk["text"],
            "embedding": embedding
        })

    joblib.dump(embedded_data, OUTPUT_PATH)
    print("✅ Embeddings saved successfully!")


def embed_query(text: str):
    return model.encode(text).tolist()


if __name__ == "__main__":
    create_embeddings()