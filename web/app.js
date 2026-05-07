const INCIDENTS_URL = "./data/incidents.json";

let allIncidents = [];

let filteredIncidents = [];


/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", async () => {
	await initializeDashboard();
});


async function initializeDashboard() {
	try {
		showLoading(true);

		const incidents = await fetchIncidents();

		allIncidents = incidents;

		filteredIncidents = [...allIncidents];

		populateCountryFilter(allIncidents);

		updateStats(allIncidents);

		renderWorldMap(allIncidents);

		renderIncidents(filteredIncidents);

		setupEventListeners();

		showLoading(false);

	} catch (error) {
		console.error(
			"[DASHBOARD ERROR]",
			error
		);

		showErrorState(
			error.message
		);
	}
}


/* =========================
   FETCHING
========================= */

async function fetchIncidents() {
	const response = await fetch(
		INCIDENTS_URL,
		{
			cache: "no-store"
		}
	);

	if (!response.ok) {
		throw new Error(
			`HTTP ${response.status}`
		);
	}

	const incidents = await response.json();

	if (!Array.isArray(incidents)) {
		throw new Error(
			"Invalid incidents JSON format."
		);
	}

	return incidents;
}


/* =========================
   FILTERING
========================= */

function setupEventListeners() {
	const searchInput =
		document.getElementById("search-input");

	const severityFilter =
		document.getElementById("severity-filter");

	const countryFilter =
		document.getElementById("country-filter");

	searchInput.addEventListener(
		"input",
		applyFilters
	);

	severityFilter.addEventListener(
		"change",
		applyFilters
	);

	countryFilter.addEventListener(
		"change",
		applyFilters
	);
}


function applyFilters() {
	const searchInput =
		document.getElementById(
			"search-input"
		);

	const severityFilter =
		document.getElementById(
			"severity-filter"
		);

	const countryFilter =
		document.getElementById(
			"country-filter"
		);

	const searchText =
		searchInput.value
			.toLowerCase()
			.trim();

	const selectedSeverity =
		severityFilter.value;

	const selectedCountry =
		countryFilter.value;

	filteredIncidents =
		allIncidents.filter((incident) => {

			const matchesSearch =
				matchesSearchText(
					incident,
					searchText
				);

			const matchesSeverity =
				matchesSeverityFilter(
					incident,
					selectedSeverity
				);

			const matchesCountry =
				matchesCountryFilter(
					incident,
					selectedCountry
				);

			return (
				matchesSearch &&
				matchesSeverity &&
				matchesCountry
			);
		});

	renderWorldMap(filteredIncidents);
	renderIncidents(filteredIncidents);
}


function matchesSearchText(
	incident,
	searchText
) {
	if (searchText === "") {
		return true;
	}

	const searchableText = `
		${incident.title || ""}
		${incident.summary || ""}
		${incident.country || ""}
		${incident.source || ""}
		${(incident.tags || []).join(" ")}
	`
		.toLowerCase();

	return searchableText.includes(
		searchText
	);
}


function matchesSeverityFilter(
	incident,
	selectedSeverity
) {
	if (selectedSeverity === "all") {
		return true;
	}

	const severityLevel =
		getSeverityLevel(
			incident.severity || 0
		);

	return severityLevel === selectedSeverity;
}


function matchesCountryFilter(
	incident,
	selectedCountry
) {
	if (selectedCountry === "all") {
		return true;
	}

	return (
		incident.country ===
		selectedCountry
	);
}


/* =========================
   RENDERING
========================= */

function renderIncidents(incidents) {
	const container =
		document.getElementById(
			"incidents"
		);

	const emptyState =
		document.getElementById(
			"empty-state"
		);

	container.innerHTML = "";

	if (incidents.length === 0) {
		container.style.display = "none";

		emptyState.style.display = "block";

		return;
	}

	emptyState.style.display = "none";

	container.style.display = "grid";

	const sortedIncidents =
		sortIncidentsBySeverity(
			incidents
		);

	for (const incident of sortedIncidents) {
		const card =
			createIncidentCard(
				incident
			);

		container.appendChild(card);
	}
}


function createIncidentCard(
	incident
) {
	const card =
		document.createElement("article");

	card.className = "incident-card";

	const severity =
		Number(
			incident.severity || 0
		);

	const severityLevel =
		getSeverityLevel(severity);

	const severityClass =
		`severity-${severityLevel}`;

	const tags =
		Array.isArray(incident.tags)
			? incident.tags
			: [];

	const tagsHtml =
		tags.map((tag) => {
			return `
				<div class="tag">
					${escapeHtml(tag)}
				</div>
			`;
		}).join("");

	const published =
		formatDate(
			incident.published
		);

	card.innerHTML = `
		<div class="incident-top">

			<div class="incident-title">
				${escapeHtml(
		incident.title || "Untitled Incident"
	)}
			</div>

			<div class="severity-badge ${severityClass}">
				${severityLevel.toUpperCase()}
			</div>

		</div>

		<div class="incident-meta">

			<div class="meta-item">
				<div class="meta-label">
					Country
				</div>

				<div class="meta-value">
					${escapeHtml(
		incident.country || "Unknown"
	)}
				</div>
			</div>

			<div class="meta-item">
				<div class="meta-label">
					Severity
				</div>

				<div class="meta-value">
					${severity}
				</div>
			</div>

			<div class="meta-item">
				<div class="meta-label">
					Source
				</div>

				<div class="meta-value">
					${escapeHtml(
		incident.source || "Unknown"
	)}
				</div>
			</div>

			<div class="meta-item">
				<div class="meta-label">
					Published
				</div>

				<div class="meta-value">
					${published}
				</div>
			</div>

		</div>

		<div class="tags">
			${tagsHtml}
		</div>

		<a
			class="read-link"
			href="${incident.url || "#"}"
			target="_blank"
			rel="noopener noreferrer">

			Read Full Article →

		</a>
	`;

	return card;
}


/* =========================
   STATS
========================= */

function updateStats(incidents) {
	updateTotalIncidents(
		incidents
	);

	updateCountryCount(
		incidents
	);

	updateCriticalEvents(
		incidents
	);

	updateLastUpdated();
}


function updateTotalIncidents(
	incidents
) {
	const element =
		document.getElementById(
			"total-incidents"
		);

	element.textContent =
		incidents.length.toLocaleString();
}


function updateCountryCount(
	incidents
) {
	const countries =
		new Set();

	for (const incident of incidents) {
		if (
			incident.country &&
			incident.country !== "Unknown"
		) {
			countries.add(
				incident.country
			);
		}
	}

	const element =
		document.getElementById(
			"total-countries"
		);

	element.textContent =
		countries.size.toLocaleString();
}


function updateCriticalEvents(
	incidents
) {
	const criticalCount =
		incidents.filter((incident) => {
			return (
				getSeverityLevel(
					incident.severity || 0
				) === "critical"
			);
		}).length;

	const element =
		document.getElementById(
			"critical-events"
		);

	element.textContent =
		criticalCount.toLocaleString();
}


function updateLastUpdated() {
	const element =
		document.getElementById(
			"last-updated"
		);

	const now =
		new Date();

	element.textContent =
		now.toLocaleTimeString(
			[],
			{
				hour: "2-digit",
				minute: "2-digit"
			}
		);
}


/* =========================
   COUNTRY FILTER
========================= */

function populateCountryFilter(
	incidents
) {
	const countryFilter =
		document.getElementById(
			"country-filter"
		);

	const countries =
		new Set();

	for (const incident of incidents) {
		if (
			incident.country &&
			incident.country !== "Unknown"
		) {
			countries.add(
				incident.country
			);
		}
	}

	const sortedCountries =
		Array.from(countries)
			.sort();

	for (const country of sortedCountries) {
		const option =
			document.createElement(
				"option"
			);

		option.value = country;

		option.textContent = country;

		countryFilter.appendChild(
			option
		);
	}
}


/* =========================
   HELPERS
========================= */

function getSeverityLevel(
	severity
) {
	if (severity >= 30) {
		return "critical";
	}

	if (severity >= 20) {
		return "high";
	}

	if (severity >= 10) {
		return "medium";
	}

	return "low";
}


function sortIncidentsBySeverity(
	incidents
) {
	return [...incidents].sort(
		(a, b) => {
			return (
				(b.severity || 0) -
				(a.severity || 0)
			);
		}
	);
}


function formatDate(dateString) {
	if (!dateString) {
		return "Unknown";
	}

	const date =
		new Date(dateString);

	if (Number.isNaN(date.getTime())) {
		return "Unknown";
	}

	return date.toLocaleDateString(
		[],
		{
			year: "numeric",
			month: "short",
			day: "numeric"
		}
	);
}


function escapeHtml(text) {
	const div =
		document.createElement("div");

	div.textContent = text;

	return div.innerHTML;
}


/* =========================
   LOADING / ERROR STATES
========================= */

function showLoading(show) {
	const loading =
		document.getElementById(
			"loading"
		);

	const incidents =
		document.getElementById(
			"incidents"
		);

	if (show) {
		loading.style.display = "flex";

		incidents.style.display = "none";

		return;
	}

	loading.style.display = "none";
}


function showErrorState(
	message
) {
	const loading =
		document.getElementById(
			"loading"
		);

	loading.innerHTML = `
		<div>
			${escapeHtml(message)}
		</div>
	`;
}