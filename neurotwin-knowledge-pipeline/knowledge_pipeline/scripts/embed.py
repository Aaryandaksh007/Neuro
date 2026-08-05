from __future__ import annotations

from sentence_transformers import SentenceTransformer
from tqdm import tqdm

from common import CHUNK_DIR, EMBEDDING_DIR, ensure_dirs, iter_jsonl, write_jsonl


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
BATCH_SIZE = 32


def main() -> None:
    ensure_dirs()

    chunks_path = CHUNK_DIR / "chunks.jsonl"
    chunks = iter_jsonl(chunks_path)
    if not chunks:
        print("No chunks found. Run scripts/chunk.py first.")
        return

    model = SentenceTransformer(MODEL_NAME)
    rows: list[dict[str, object]] = []

    for start in tqdm(range(0, len(chunks), BATCH_SIZE), desc="Embedding chunks"):
        batch = chunks[start : start + BATCH_SIZE]
        texts = [row["text"] for row in batch]
        vectors = model.encode(texts, normalize_embeddings=True).tolist()

        for row, vector in zip(batch, vectors):
            rows.append(
                {
                    "id": row["id"],
                    "embedding": vector,
                    "metadata": {
                        "document_id": row["document_id"],
                        "chunk_index": row["chunk_index"],
                        "topic": row["topic"],
                        "title": row["title"],
                        "url": row["url"],
                        "word_count": row["word_count"],
                    },
                    "text": row["text"],
                }
            )

    output_path = EMBEDDING_DIR / "embeddings.jsonl"
    write_jsonl(output_path, rows)
    print(f"Wrote {len(rows)} embeddings to {output_path}")


if __name__ == "__main__":
    main()
