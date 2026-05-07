import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin

from parse import parse_article


BASE_URL: str = "https://chinaaid.org/latest-news/"


def collect_china_aid() -> list[dict[str, Any]]:
	incidents: list[dict[str, Any]] = []

	print("[FETCH HTML] ChinaAid")
	print(f"[URL] {BASE_URL}")

	try:
		response = requests.get(
			BASE_URL,
			timeout=20,
			headers={
				"User-Agent": (
					"Mozilla/5.0 GospelWatch"
				)
			}
		)

		response.raise_for_status()

	except requests.RequestException as error:
		print(
			f"[ERROR] ChinaAid request failed: "
			f"{error}"
		)

		return incidents

	soup = BeautifulSoup(
		response.text,
		"html.parser"
	)

	article_links: list[Any] = soup.select(
		"h2.entry-title a"
	)

	if len(article_links) == 0:
		article_links = soup.select(
			"article a"
		)

	print(
		f"[INFO] ChinaAid article links: "
		f"{len(article_links)}"
	)

	seen_urls: set[str] = set()

	for link in article_links:
		href: str | None = link.get("href")

		if href is None:
			continue

		title: str = link.get_text(
			strip=True
		)

		if len(title) < 20:
			continue

		full_url: str = urljoin(
			BASE_URL,
			href
		)

		if full_url in seen_urls:
			continue

		seen_urls.add(full_url)

		if (
			"/tag/" in full_url
			or "/category/" in full_url
			or "#" in full_url
		):
			continue

		combined_text: str = title

		parsed_data: dict[str, Any] = parse_article(
			combined_text
		)

		incident: dict[str, Any] = {
			"title": title,
			"summary": "",
			"source": "ChinaAid",
			"url": full_url,
			"published": "",
			"country": parsed_data["country"],
			"severity": parsed_data["severity"],
			"tags": parsed_data["tags"],
			"matched_keywords": (
				parsed_data["matched_keywords"]
			),
			"collected_at": datetime.now(
				timezone.utc
			).isoformat()
		}

		incidents.append(incident)

		print(f"[ADD] {title}")

	print(
		f"[DONE] ChinaAid incidents: "
		f"{len(incidents)}"
	)

	return incidents