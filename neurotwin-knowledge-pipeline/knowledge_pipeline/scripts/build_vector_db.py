from __future__ import annotations

import chromadb

from common import EMBEDDING_DIR, VECTOR_DIR, ensure_dirs, iter_jsonl


COLLECTION_NAME = "neurotwin_knowledge"
BATCH_SIZE = 200


def main() -> None:
    ensure_dirs()

    embeddings_path = EMBEDDING_DIR / "embeddings.jsonl"
    rows = iter_jsonl(embeddings_path)
    if not rows:
        print("No embeddings found. Run scripts/embed.py first.")
        return

    client = chromadb.PersistentClient(path=str(VECTOR_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "NeuroTwin trusted education and neurodiversity knowledge"},
    )

    for start in range(0, len(rows), BATCH_SIZE):
        batch = rows[start : start + BATCH_SIZE]
        collection.upsert(
            ids=[row["id"] for row in batch],
            documents=[row["text"] for row in batch],
            embeddings=[row["embedding"] for row in batch],
            metadatas=[row["metadata"] for row in batch],
        )

    print(f"Stored {collection.count()} chunks in {VECTOR_DIR}")


if __name__ == "__main__":
    main()
