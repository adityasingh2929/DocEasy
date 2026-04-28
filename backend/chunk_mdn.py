import json
import re
import os

# ---------------- CLEANING ---------------- #

def clean_text(text):
    # Remove MDN macros {{...}}
    text = re.sub(r'\{\{.*?\}\}', '', text, flags=re.DOTALL)

    # Remove code blocks ```...```
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)

    # Remove inline code `...`
    text = re.sub(r'`.*?`', '', text)

    # Remove HTML tags
    text = re.sub(r'<[^>]*>', '', text)

    # Remove JS-heavy lines (heuristic)
    lines = text.split('\n')
    filtered_lines = []
    for line in lines:
        if any(keyword in line for keyword in [
            "function", "=>", "console.", "document.", "return ",
            "{", "}", "()", ";"
        ]):
            continue
        filtered_lines.append(line)

    text = '\n'.join(filtered_lines)

    # 🔥 Remove UI/sample junk
    text = re.sub(r'\b(Email|Name|Age|Click|Submit)\b.*', '', text)

    # 🔥 Remove isolated number sequences (e.g. "12 14 16")
    text = re.sub(r'\b\d+\b(\s+\d+\b)+', '', text)

    # 🔥 Remove "Here's the JavaScript" style text
    text = re.sub(r"Here'?s the JavaScript:.*", '', text, flags=re.IGNORECASE)

    # Normalize whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'\s+', ' ', text)

    return text.strip()


# ---------------- SEMANTIC SPLIT ---------------- #

def split_by_headers(text):
    """
    Split text into semantic sections using headings.
    """
    sections = re.split(r'\n#{1,6}\s+', text)

    sections = [s.strip() for s in sections if len(s.strip()) > 50]

    return sections if sections else [text]


# ---------------- SENTENCE SPLIT ---------------- #

def split_into_sentences(text):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]


# ---------------- CHUNKING ---------------- #

def chunk_text(text, max_words=220, overlap=40):
    """
    Chunk text using sentence-aware splitting + overlap
    """
    sentences = split_into_sentences(text)

    chunks = []
    current_chunk = []
    current_word_count = 0

    def flush_chunk():
        nonlocal current_chunk, current_word_count
        if current_chunk:
            chunks.append(" ".join(current_chunk))

            # overlap (word-based)
            overlap_words = current_chunk[-overlap:] if overlap > 0 else []
            current_chunk = overlap_words.copy()
            current_word_count = len(current_chunk)

    for sentence in sentences:
        words = sentence.split()

        if current_word_count + len(words) > max_words:
            flush_chunk()

        current_chunk.extend(words)
        current_word_count += len(words)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


# ---------------- MAIN PIPELINE ---------------- #

def main():
    input_file = os.path.join("data", "mdn_clean.json")
    output_file = os.path.join("data", "chunks.json")

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    all_chunks = []
    topic_counters = {}

    for entry in data:
        topic = entry.get("topic", "unknown")
        raw_text = entry.get("text", "")

        # 1. Clean text
        cleaned = clean_text(raw_text)
        if not cleaned:
            continue

        # 2. Semantic split
        sections = split_by_headers(cleaned)

        for section in sections:
            # 3. Chunk section
            chunks = chunk_text(section)

            for chunk in chunks:
                if len(chunk.split()) < 20:
                    continue

                topic_counters[topic] = topic_counters.get(topic, 0) + 1
                chunk_id = f"{topic}_{topic_counters[topic]}"

                all_chunks.append({
                    "topic": topic,
                    "chunk_id": chunk_id,
                    "text": chunk
                })

    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, indent=2)

    print(f"✅ Generated {len(all_chunks)} chunks")
    print(f"📁 Saved to {output_file}")


if __name__ == "__main__":
    main()