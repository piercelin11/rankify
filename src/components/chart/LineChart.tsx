"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Ticks,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Filler } from "chart.js";
import { ensureBrightness } from "@/lib/utils/adjustColor";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

type Data = {
	date: string[];
	dataset: {
		trackName: string | undefined;
		color: string | null | undefined;
		rankings: (number | null)[];
	}[];
};

export function LineChart({ data: { date, dataset } }: { data: Data }) {
	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
				// position: 'bottom',
				labels: {
					display: false,
					padding: 30,
					usePointStyle: true,
					boxWidth: 6,
				},
				title: {
					padding: {
						left: 30,
					},
				},
			},
			tooltip: {
				padding: 18,
				titleMarginBottom: 15,
				displayColors: false,
				//mode: 'index',
				// intersect: false,
				titleFont: {
					size: 16,
					weight: 600,
				},
				bodyFont: {
					size: 14,
					lineHeight: 2,
				},
			},
		},
		scales: {
			y: {
				beginAtZero: false,
				suggestedMin: 1,
				
				reverse: true,
				grid: {
					color: "#181818",
				},
				border: {
					color: "#181818",
				},
				ticks: {
					precision: 0
				}
			},
			x: {
				border: {
					color: "#181818",
				},
				grid: {
					color: "#18181800",
				},
			},
		},
	};

	const data = {
		labels: date,
		datasets: dataset.map((item) => ({
			label: item.trackName,
			data: item.rankings,
			borderWidth: 1.5,
			borderColor: item.color
				? ensureBrightness(item.color)
				: "#FEF27A",
			backgroundColor: item.color
				? `${ensureBrightness(item.color)}1A`
				: "#FEF27A1A",
			fill: "start",
		})),
	};

	return <Line options={options} data={data} />;
}
