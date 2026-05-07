let worldMap = null;

function buildCountryStats(incidents) {
	const stats = {};

	for (const incident of incidents) {

		const country = incident.country || "Unknown";

		if (!stats[country]) {
			stats[country] = {
				count: 0,
				critical: 0,
				high: 0,
				medium: 0,
				low: 0
			};
		}

		stats[country].count += 1;

		const severityLevel =
			getSeverityLevel(
				Number(
					incident.severity || 0
				)
			);

		if (
			stats[country][severityLevel]
			!== undefined
		) {
			stats[country][severityLevel] += 1;
		}
	}

	return stats;
}

function renderWorldMap(incidents) {

	const mapElement = document.getElementById(
		"world-map"
	);

	if (!mapElement) {
		return;
	}

	if (worldMap === null) {
		worldMap = echarts.init(mapElement);
	}

	const countryStats = buildCountryStats(
		incidents
	);

	const mapData = [];

	for (const [
		country,
		data
	] of Object.entries(countryStats)) {

		mapData.push({
			name: country,
			value: data.count,
			critical: data.critical,
			high: data.high,
			medium: data.medium,
			low: data.low
		});
	}

	const option = {

		backgroundColor: "transparent",

		tooltip: {
			trigger: "item",

			formatter: function (params) {

				if (!params.data) {
					return (
						params.name +
						"<br>No incidents"
					);
				}

				return `
					<strong>${params.name}</strong>
					<br>Total Incidents: ${params.data.value}
					<br>Critical: ${params.data.critical}
					<br>High: ${params.data.high}
					<br>Medium: ${params.data.medium}
					<br>Low: ${params.data.low}
				`;
			}
		},

		visualMap: {
			min: 0,
			max: 25,

			text: [
				"High",
				"Low"
			],

			realtime: false,

			calculable: true,

			inRange: {
				color: [
					"#1e293b",
					"#7f1d1d",
					"#dc2626"
				]
			},

			textStyle: {
				color: "#f5f7fb"
			}
		},

		series: [
			{
				name: "Incidents",

				type: "map",

				map: "world",

				roam: true,

				emphasis: {
					label: {
						show: true,
						color: "#ffffff"
					}
				},

				itemStyle: {
					borderColor: "#334155",

					areaColor: "#1e293b"
				},

				data: mapData
			}
		]
	};

	worldMap.setOption(option);
	worldMap.off("click");

	worldMap.on(
		"click",
		function (params) {

			if (!params.name) {
				return;
			}

			const countryFilter =
				document.getElementById(
					"country-filter"
				);

			if (!countryFilter) {
				return;
			}

			countryFilter.value =
				params.name;

			applyFilters();
		}
	);

	window.addEventListener(
		"resize",
		function () {
			worldMap.resize();
		}
	);
}