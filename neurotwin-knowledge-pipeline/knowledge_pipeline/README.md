# NeuroTwin Knowledge Pipeline

This folder collects trusted learning and neurodiversity content for a RAG system.

The pipeline accepts web pages and direct PDF links. It saves raw text, cleans it, chunks it, creates embeddings, and builds a local Chroma vector database.

## Setup

```bash
cd knowledge_pipeline
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python scripts/scrape.py
python scripts/clean.py
python scripts/chunk.py
python scripts/embed.py
python scripts/build_vector_db.py
```

## Query Test

```bash
python scripts/query.py "How can a student with ADHD stay focused?"
```

## Add More Sources

Edit `sources.json`.

Use public, trusted sources only. Prefer government, nonprofit, university, and open textbook sources. The scraper checks `robots.txt` before fetching each URL and only collects the exact URLs listed in `sources.json`.

## Output Folders

- `data/raw`: extracted source documents with metadata
- `data/cleaned`: normalized text
- `data/chunks/chunks.jsonl`: retrieval chunks
- `data/embeddings/embeddings.jsonl`: chunk embeddings
- `data/vector_db`: Chroma database

## Notes

You do not need PDFs for RAG. Clean HTML pages are often better because they extract into cleaner text and are easier to cite.
