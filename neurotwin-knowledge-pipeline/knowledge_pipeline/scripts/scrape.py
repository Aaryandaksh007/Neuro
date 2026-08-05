from __future__ import annotations

import io
import mimetypes
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import fitz
import requests
import trafilatura
from tqdm import tqdm

from common import RAW_DIR, SOURCES_PATH, ensure_dirs, read_json, slugify, stable_id, write_json


USER_AGENT = "NeuroTwinKnowledgePipeline/1.0 (+local educational RAG prototype)"
TIMEOUT_SECONDS = 30


def can_fetch(url: str) -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    parser = RobotFileParser()
    parser.set_url(robots_url)

    try:
        parser.read()
    except Exception:
        return True

    return parser.can_fetch(USER_AGENT, url)


def is_pdf(url: str, content_type: str | None) -> bool:
    guessed_type = mimetypes.guess_type(url)[0]
    return "pdf" in (content_type or "").lower() or guessed_type == "application/pdf"


def extract_pdf_text(content: bytes) -> str:
    text_parts: list[str] = []
    with fitz.open(stream=io.BytesIO(content), filetype="pdf") as document:
        for page in document:
            text_parts.append(page.get_text("text"))
    return "\n".join(text_parts)


def extract_html_text(html: str, url: str) -> str:
    extracted = trafilatura.extract(
        html,
        url=url,
        include_comments=False,
        include_tables=True,
        favor_precision=True,
    )
    return extracted or ""


def fetch_source(source: dict[str, str]) -> dict[str, str] | None:
    url = source["url"]
    if not can_fetch(url):
        print(f"Skipped by robots.txt: {url}")
        return None

    response = requests.get(
        url,
        headers={"User-Agent": USER_AGENT},
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    content_type = response.headers.get("content-type")
    if is_pdf(url, content_type):
        text = extract_pdf_text(response.content)
        source_type = "pdf"
    else:
        text = extract_html_text(response.text, url)
        source_type = "html"

    text = text.strip()
    if not text:
        print(f"No useful text extracted: {url}")
        return None

    return {
        "id": stable_id(url),
        "topic": source.get("topic", "General"),
        "title": source.get("title", url),
        "url": url,
        "source_type": source_type,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "text": text,
    }


def main() -> None:
    ensure_dirs()
    sources = read_json(SOURCES_PATH)

    for source in tqdm(sources, desc="Collecting sources"):
        try:
            document = fetch_source(source)
        except Exception as error:
            print(f"Failed {source['url']}: {error}")
            continue

        if document is None:
            continue

        filename = f"{slugify(document['topic'])}-{slugify(document['title'])}-{document['id']}.json"
        write_json(RAW_DIR / filename, document)
        print(f"Saved {Path(filename).name}")


if __name__ == "__main__":
    main()
