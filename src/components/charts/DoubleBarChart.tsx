"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { adjustColorLightness } from "@/lib/utils/colorAdjustment";
import { toAcronym } from "@/lib/utils/helper";
import { DEFAULT_COLOR } from "@/config/variables";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const options = {
	responsive: true,
	scales: {
		y: {
			grid: {
				color: "#27272a80",
			},
			border: {
				color: "#27272a80",
			},
		},
		x: {
			border: {
				color: "#27272a80",
			},
			grid: {
				color: "#27272a80",
			},
		},
	},
	barPercentage: 0.7,
	categoryPercentage: 0.6,
	plugins: {
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
};

type DataType = {
	data: {
		labels: string[];
		mainData: number[];
		subData: (number | null)[];
		color: (string | null)[];
	};
};

export default function DoubleBarChart({
	data: { labels, mainData, subData, color },
}: DataType) {
	const data = {
		labels: labels.map((label) => toAcronym(label)),
		datasets: [
			{
				label: "points",
				data: mainData,
				borderWidth: 1.5,
				borderColor: DEFAULT_COLOR + "BF",
				backgroundColor: DEFAULT_COLOR + "BF",
				hoverBackgroundColor: color.map(
					(item) => adjustColorLightness(item!, 0.4, 1.5) + "80"
				),
				hoverBorderColor: color.map((item) =>
					adjustColorLightness(item!, 0.6, 2)
				),
			},
			{
				label: "raw points",
				data: subData,
				borderWidth: 1.5,
				borderColor: "#464748BF",
				backgroundColor: "#464748BF",
				hoverBackgroundColor: color.map(
					(item) => adjustColorLightness(item!, 0.2, 1.5) + "66"
				),
				hoverBorderColor: color.map((item) =>
					adjustColorLightness(item!, 0.6, 2)
				),
			},
		],
	};

	return (
		<div className="aspect-[2/1]">
			<Bar options={options} data={data} />
		</div>
	);
}
