from __future__ import annotations

from common import CHUNK_DIR, CLEAN_DIR, ensure_dirs, read_json, stable_id, write_jsonl


CHUNK_WORDS = 450
OVERLAP_WORDS = 80


def make_chunks(words: list[str]) -> list[str]:
    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = min(start + CHUNK_WORDS, len(words))
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)

        if end == len(words):
            break

        start = max(end - OVERLAP_WORDS, start + 1)

    return chunks


def main() -> None:
    ensure_dirs()
    rows: list[dict[str, object]] = []

    cleaned_files = sorted(CLEAN_DIR.glob("*.json"))
    if not cleaned_files:
        print("No cleaned documents found. Run scripts/clean.py first.")
        return

    for cleaned_file in cleaned_files:
        document = read_json(cleaned_file)
        words = document.get("text", "").split()

        for index, text in enumerate(make_chunks(words)):
            chunk_id = stable_id(f"{document['id']}:{index}:{text[:120]}")
            rows.append(
                {
                    "id": chunk_id,
                    "document_id": document["id"],
                    "chunk_index": index,
                    "topic": document["topic"],
                    "title": document["title"],
                    "url": document["url"],
                    "text": text,
                    "word_count": len(text.split()),
                }
            )

    output_path = CHUNK_DIR / "chunks.jsonl"
    write_jsonl(output_path, rows)
    print(f"Wrote {len(rows)} chunks to {output_path}")


if __name__ == "__main__":
    main()
