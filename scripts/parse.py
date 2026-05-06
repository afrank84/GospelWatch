import os
from typing import Any

import yaml


BASE_DIR: str = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

KEYWORDS_FILE: str = os.path.join(
    BASE_DIR,
    "config",
    "keywords.yml"
)


def load_keywords() -> list[dict[str, Any]]:
    with open(KEYWORDS_FILE, "r", encoding="utf-8") as file:
        data: dict[str, Any] = yaml.safe_load(file)

    return data.get("rules", [])


def detect_country(text: str) -> str:
    countries: list[str] = [
        "Nigeria",
        "China",
        "India",
        "Iran",
        "Pakistan",
        "North Korea",
        "Sudan",
        "Mozambique",
        "Kenya",
        "Congo"
    ]

    text_lower: str = text.lower()

    for country in countries:
        if country.lower() in text_lower:
            return country

    return "Unknown"


def parse_article(text: str) -> dict[str, Any]:
    rules: list[dict[str, Any]] = load_keywords()

    text_lower: str = text.lower()

    severity: int = 0

    tags: list[str] = []

    matched_keywords: list[str] = []

    for rule in rules:
        tag: str = str(rule.get("tag", ""))

        rule_severity: int = int(
            rule.get("severity", 0)
        )

        keywords: list[str] = rule.get(
            "keywords",
            []
        )

        for keyword in keywords:
            keyword_lower: str = keyword.lower()

            if keyword_lower in text_lower:
                severity += rule_severity

                if tag not in tags:
                    tags.append(tag)

                matched_keywords.append(keyword)

    country: str = detect_country(text)

    return {
        "country": country,
        "severity": severity,
        "tags": tags,
        "matched_keywords": matched_keywords
    }