# GospelWatch

GospelWatch is a lightweight, Git-native persecution monitoring system focused on tracking hostility toward Christians, churches, missionaries, evangelism, and religious freedom around the world.

The project uses scheduled GitHub Actions, YAML-driven rules, deterministic parsing, and static dashboards to collect and organize publicly available persecution news and incident reports.

No AI.
No opaque scoring.
No black-box processing.

Everything is transparent, auditable, versioned, and reproducible.

---

# Goals

- Track persecution-related incidents globally
- Aggregate reports from multiple watchdog organizations
- Normalize incident data into a common format
- Generate searchable historical datasets
- Provide map-based visibility into hostile regions
- Maintain a fully transparent rule-based pipeline
- Keep infrastructure lightweight and self-hostable

---

# Features

- Scheduled GitHub Actions collection pipeline
- YAML-driven configuration
- RSS and HTML scraping support
- Deterministic keyword classification
- Severity scoring
- Country and region tagging
- Static JSON exports
- SQLite incident database
- Interactive map support
- GitHub Pages dashboard support
- Git-based historical tracking

---

# Architecture

```text
Sources
  ↓
Collectors
  ↓
Keyword Matching
  ↓
Normalization
  ↓
SQLite / JSON
  ↓
Dashboard / Map / Alerts
```

---

# Repository Structure

```text
persecution-monitor/
├── .github/workflows/
│   └── collect.yml
├── config/
│   ├── sources.yml
│   ├── keywords.yml
│   └── alerts.yml
├── scripts/
│   ├── collect.py
│   ├── parse.py
│   └── generate_map.py
├── data/
│   ├── incidents.json
│   └── incidents.db
├── web/
│   ├── index.html
│   ├── app.js
│   └── map.js
└── requirements.txt
```

---

# Example Incident Record

```json
{
  "title": "Church burned in northern Nigeria",
  "country": "Nigeria",
  "severity": 15,
  "tags": [
    "church_attack"
  ],
  "source": "ICC",
  "published": "2026-05-06"
}
```

---

# Configuration Philosophy

GospelWatch is configuration-driven.

Most system behavior is controlled through YAML files instead of hardcoded logic.

This allows:
- transparent rule changes
- Git diff visibility
- contributor-friendly updates
- deterministic processing
- simplified auditing

Example:

```yaml
rules:
  - tag: killing
    severity: 10
    keywords:
      - killed
      - murdered
      - executed
```

---

# Data Sources

Potential sources include:
- Open Doors
- International Christian Concern
- Voice of the Martyrs
- Vatican News
- Local and regional news organizations
- Religious freedom watchdogs

Source quality and reliability may vary.

---

# Design Principles

- Static-first
- Git-native
- Minimal infrastructure
- Deterministic processing
- Human-readable data
- Long-term archival friendly
- Self-hostable
- Transparent scoring

---

# Running Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Run collector:

```bash
python scripts/collect.py
```

Generate map data:

```bash
python scripts/generate_map.py
```

---

# GitHub Actions

The collection pipeline is designed to run on a schedule using GitHub Actions.

Example schedule:

```yaml
schedule:
  - cron: "0 * * * *"
```

---

# Future Ideas

- GeoJSON country heatmaps
- Incident timelines
- RSS export feeds
- Country severity trends
- Webhook notifications
- Historical analytics
- Incident verification scoring
- Regional watchlists
- Multi-source confirmation tracking

---

# Disclaimer

GospelWatch aggregates publicly available reporting from third-party sources.

Reports may contain inaccuracies, incomplete information, or differing interpretations depending on source origin and geopolitical context.

Users should verify critical information through multiple sources whenever possible.

---

# License

MIT
