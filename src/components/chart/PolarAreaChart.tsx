"use client";

import React from "react";
import {
	Chart as ChartJS,
	RadialLinearScale,
	ArcElement,
	Tooltip,
	Legend,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";
import { adjustSaturation, ensureBrightness } from "@/lib/utils/adjustColor";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const options = {
	responsive: true,
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			padding: 18,
			displayColors: false,
			titleFont: {
				size: 16,
				weight: 600,
			},
			bodyFont: {
				size: 14,
			},
		},
	},
	scales: {
		r: {
			grid: {
				color: "#252525",
			},
			ticks: {
				color: "#505050",
				backdropColor: "#15151500",
			},
		},
	},
};

type DataType = {
	labels: string[];
	mainData: number[];
	color: (string | null)[];
};

function PolarAreaChart({
	data: { labels, mainData, color },
}: {
	data: DataType;
}) {
	const data = {
		labels,
		datasets: [
			{
				label: "label",
				data: mainData,
				backgroundColor: color.map(
					(item) => adjustSaturation(ensureBrightness(item), 0.15) + "11"
				),
				borderColor: color.map(
					(item) => adjustSaturation(ensureBrightness(item), 0.15) + "CC"
				),
				hoverBackgroundColor: color.map(
					(item) => adjustSaturation(ensureBrightness(item), 0.15) + "66"
				),
				hoverBorderColor: color.map(
					(item) => adjustSaturation(ensureBrightness(item), 0.15) + "99"
				),
				borderWidth: 1.5,
			},
		],
	};

	return <PolarArea data={data} options={options} />;
}

export default PolarAreaChart;
