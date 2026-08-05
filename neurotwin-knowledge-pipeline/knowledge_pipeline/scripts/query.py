from __future__ import annotations

import sys

import chromadb
from sentence_transformers import SentenceTransformer

from common import VECTOR_DIR


COLLECTION_NAME = "neurotwin_knowledge"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def main() -> None:
    question = " ".join(sys.argv[1:]).strip()
    if not question:
        print('Usage: python scripts/query.py "your question"')
        return

    client = chromadb.PersistentClient(path=str(VECTOR_DIR))
    collection = client.get_collection(COLLECTION_NAME)
    model = SentenceTransformer(MODEL_NAME)
    query_embedding = model.encode([question], normalize_embeddings=True).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5,
        include=["documents", "metadatas", "distances"],
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for index, (document, metadata, distance) in enumerate(zip(documents, metadatas, distances), start=1):
        print(f"\nResult {index} | score distance {distance:.4f}")
        print(f"{metadata['title']} ({metadata['topic']})")
        print(metadata["url"])
        print(document[:700].strip() + ("..." if len(document) > 700 else ""))


if __name__ == "__main__":
    main()
