from __future__ import annotations

import re

from common import CLEAN_DIR, RAW_DIR, ensure_dirs, read_json, write_json


BOILERPLATE_PATTERNS = [
    r"\bEspa(?:n|ñ)ol\b",
    r"\bPrint\b",
    r"\bShare\b",
    r"\bSubscribe\b",
    r"\bRelated topics?\b",
]


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    lines = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            lines.append("")
            continue

        if any(re.fullmatch(pattern, line, flags=re.IGNORECASE) for pattern in BOILERPLATE_PATTERNS):
            continue

        lines.append(line)

    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def main() -> None:
    ensure_dirs()

    raw_files = sorted(RAW_DIR.glob("*.json"))
    if not raw_files:
        print("No raw documents found. Run scripts/scrape.py first.")
        return

    for raw_file in raw_files:
        document = read_json(raw_file)
        document["text"] = normalize_text(document.get("text", ""))
        document["word_count"] = len(document["text"].split())
        write_json(CLEAN_DIR / raw_file.name, document)
        print(f"Cleaned {raw_file.name}")


if __name__ == "__main__":
    main()
