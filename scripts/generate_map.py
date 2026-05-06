import json
import os
from typing import Any


BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INCIDENTS_FILE: str = os.path.join(
    BASE_DIR,
    "data",
    "incidents.json"
)

MAP_FILE: str = os.path.join(
    BASE_DIR,
    "data",
    "map.json"
)


def load_incidents() -> list[dict[str, Any]]:
    if not os.path.exists(INCIDENTS_FILE):
        print("[WARN] incidents.json does not exist")
        return []

    with open(INCIDENTS_FILE, "r", encoding="utf-8") as file:
        try:
            data: Any = json.load(file)

            if isinstance(data, list):
                return data

            return []

        except json.JSONDecodeError:
            print("[ERROR] Invalid JSON in incidents.json")
            return []


def build_country_summary(
    incidents: list[dict[str, Any]]
) -> dict[str, dict[str, Any]]:
    countries: dict[str, dict[str, Any]] = {}

    for incident in incidents:
        country: str = str(
            incident.get("country", "Unknown")
        ).strip()

        severity: int = int(
            incident.get("severity", 0)
        )

        if country == "":
            country = "Unknown"

        if country not in countries:
            countries[country] = {
                "country": country,
                "incident_count": 0,
                "total_severity": 0,
                "max_severity": 0,
                "tags": {}
            }

        countries[country]["incident_count"] += 1
        countries[country]["total_severity"] += severity

        if severity > countries[country]["max_severity"]:
            countries[country]["max_severity"] = severity

        tags: list[str] = incident.get("tags", [])

        for tag in tags:
            if tag not in countries[country]["tags"]:
                countries[country]["tags"][tag] = 0

            countries[country]["tags"][tag] += 1

    return countries


def calculate_risk_level(severity: int) -> str:
    if severity >= 30:
        return "critical"

    if severity >= 20:
        return "high"

    if severity >= 10:
        return "medium"

    if severity >= 1:
        return "low"

    return "none"


def build_map_data(
    countries: dict[str, dict[str, Any]]
) -> list[dict[str, Any]]:
    map_data: list[dict[str, Any]] = []

    for country_name, data in countries.items():
        total_severity: int = int(
            data["total_severity"]
        )

        risk_level: str = calculate_risk_level(
            total_severity
        )

        map_entry: dict[str, Any] = {
            "country": country_name,
            "incident_count": data["incident_count"],
            "total_severity": total_severity,
            "max_severity": data["max_severity"],
            "risk_level": risk_level,
            "tags": data["tags"]
        }

        map_data.append(map_entry)

    map_data = sorted(
        map_data,
        key=lambda item: int(item["total_severity"]),
        reverse=True
    )

    return map_data


def save_map_data(
    map_data: list[dict[str, Any]]
) -> None:
    with open(MAP_FILE, "w", encoding="utf-8") as file:
        json.dump(
            map_data,
            file,
            indent=2,
            ensure_ascii=False
        )


def main() -> None:
    incidents: list[dict[str, Any]] = load_incidents()

    print(f"[INFO] Loaded incidents: {len(incidents)}")

    countries: dict[str, dict[str, Any]] = (
        build_country_summary(incidents)
    )

    map_data: list[dict[str, Any]] = build_map_data(
        countries
    )

    save_map_data(map_data)

    print(f"[DONE] Generated map.json")
    print(f"[INFO] Countries: {len(map_data)}")


if __name__ == "__main__":
    main()