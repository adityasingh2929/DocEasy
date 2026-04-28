import joblib
import os
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EMBEDDINGS_PATH = os.path.join(BASE_DIR, "data", "embeddings.joblib")

data = joblib.load(EMBEDDINGS_PATH)


def retrieve_chunks(query_embedding, topic=None, top_k=2):
    """
    Robust retriever:
    - Topic filtering first
    - Similarity ranking
    - Safe fallback (full dataset if topic is empty)
    - No hard thresholds (always returns results)
    """

    # 1. Filter by topic (if available)
    filtered_data = []
    if topic:
        filtered_data = [item for item in data if item["topic"] == topic]

    # 2. If no topic matches -> fallback to full dataset
    if not filtered_data:
        filtered_data = list(data)

    # 3. Compute cosine similarity
    embeddings = [item["embedding"] for item in filtered_data]
    similarities = cosine_similarity(
        [query_embedding],
        embeddings
    )[0]

    # 4. Sort by similarity
    ranked = sorted(
        zip(filtered_data, similarities),
        key=lambda x: x[1],
        reverse=True
    )

    # 5. ALWAYS return top_k results (never return empty list)
    results = [
        {
            "text": item["text"],
            "topic": item["topic"],
            "score": float(score)
        }
        for item, score in ranked
    ][:top_k]

    return results