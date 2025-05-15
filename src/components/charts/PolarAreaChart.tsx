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
import { adjustColor } from "@/lib/utils/color.utils";

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

export default function PolarAreaChart({
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
					(item) => adjustColor(item!, 0.2, 1.5) + "66"
				),
				borderColor: color.map(
					(item) => adjustColor(item!, 0.6, 2)
				),
				hoverBackgroundColor: color.map(
					(item) => adjustColor(item!, 0.4, 1.5) + "80"
				),
				hoverBorderColor: color.map(
					(item) => adjustColor(item!, 0.6, 2)
				),
				borderWidth: 1.5,
			},
		],
	};

	return <div className="aspect-square"><PolarArea data={data} options={options} /></div>;
}
