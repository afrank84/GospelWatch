import json
import os
from datetime import datetime, timezone
from typing import Any

import feedparser
import yaml

from parse import parse_article


BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SOURCES_FILE: str = os.path.join(BASE_DIR, "config", "sources.yml")
INCIDENTS_FILE: str = os.path.join(BASE_DIR, "data", "incidents.json")
HISTORY_DIR: str = os.path.join(BASE_DIR, "data", "history")


def load_yaml(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def load_existing_incidents() -> list[dict[str, Any]]:
    if not os.path.exists(INCIDENTS_FILE):
        return []

    with open(INCIDENTS_FILE, "r", encoding="utf-8") as file:
        try:
            data: Any = json.load(file)

            if isinstance(data, list):
                return data

            return []

        except json.JSONDecodeError:
            return []


def save_incidents(incidents: list[dict[str, Any]]) -> None:
    with open(INCIDENTS_FILE, "w", encoding="utf-8") as file:
        json.dump(incidents, file, indent=2, ensure_ascii=False)


def save_history_snapshot(incidents: list[dict[str, Any]]) -> None:
    timestamp: str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    history_file: str = os.path.join(HISTORY_DIR, f"{timestamp}.json")

    with open(history_file, "w", encoding="utf-8") as file:
        json.dump(incidents, file, indent=2, ensure_ascii=False)


def incident_exists(
    existing_incidents: list[dict[str, Any]],
    url: str
) -> bool:
    for incident in existing_incidents:
        if incident.get("url") == url:
            return True

    return False


def normalize_entry(
    source_name: str,
    entry: Any
) -> dict[str, Any]:
    title: str = getattr(entry, "title", "").strip()
    summary: str = getattr(entry, "summary", "").strip()
    link: str = getattr(entry, "link", "").strip()

    published: str = ""

    if hasattr(entry, "published"):
        published = str(entry.published)

    combined_text: str = f"{title}\n{summary}"

    parsed_data: dict[str, Any] = parse_article(combined_text)

    incident: dict[str, Any] = {
        "title": title,
        "summary": summary,
        "source": source_name,
        "url": link,
        "published": published,
        "country": parsed_data["country"],
        "severity": parsed_data["severity"],
        "tags": parsed_data["tags"],
        "matched_keywords": parsed_data["matched_keywords"],
        "collected_at": datetime.now(
            timezone.utc
        ).isoformat()
    }

    return incident


def process_feed(
    source: dict[str, Any],
    incidents: list[dict[str, Any]]
) -> None:
    source_name: str = str(source.get("name", "Unknown"))
    source_url: str = str(source.get("url", ""))
    enabled: bool = bool(source.get("enabled", True))

    if not enabled:
        print(f"[SKIP] {source_name} disabled")
        return

    print(f"[FETCH] {source_name}")
    print(f"[URL] {source_url}")

    feed: Any = feedparser.parse(source_url)

    if hasattr(feed, "bozo") and feed.bozo:
        print(f"[ERROR] Failed parsing feed: {source_name}")
        return

    for entry in feed.entries:
        link: str = getattr(entry, "link", "").strip()

        if link == "":
            continue

        if incident_exists(incidents, link):
            continue

        incident: dict[str, Any] = normalize_entry(
            source_name,
            entry
        )

        incidents.append(incident)

        print(f"[ADD] {incident['title']}")


def sort_incidents(
    incidents: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    return sorted(
        incidents,
        key=lambda item: int(item.get("severity", 0)),
        reverse=True
    )


def main() -> None:
    os.makedirs(HISTORY_DIR, exist_ok=True)

    sources_config: dict[str, Any] = load_yaml(SOURCES_FILE)

    sources: list[dict[str, Any]] = sources_config.get(
        "sources",
        []
    )

    incidents: list[dict[str, Any]] = load_existing_incidents()

    print(f"[INFO] Existing incidents: {len(incidents)}")

    for source in sources:
        process_feed(source, incidents)

    incidents = sort_incidents(incidents)

    save_incidents(incidents)

    save_history_snapshot(incidents)

    print(f"[DONE] Total incidents: {len(incidents)}")


if __name__ == "__main__":
    main()