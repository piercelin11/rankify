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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Filler } from "chart.js";
import { adjustColor } from "@/lib/utils/color.utils";
import { DEFAULT_COLOR } from "@/constants";

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
		name: string | undefined;
		color: string | null | undefined;
		datas: (number | null)[];
	}[];
};

export function LineChart({
	data: { date, dataset },
	isReverse = true,
}: {
	data: Data;
	isReverse?: boolean;
}) {
	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
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
				min: isReverse ? 1 : undefined,

				reverse: isReverse,
				grid: {
					color: "#27272a",
				},
				border: {
					color: "#27272a",
				},
				ticks: {
					precision: 0,
				},
			},
			x: {
				border: {
					color: "#27272a",
				},
				grid: {
					color: "#27272a00",
				},
			},
		},
	};

	const data = {
		labels: date,
		datasets: dataset.map((item) => ({
			label: item.name,
			data: item.datas,
			borderWidth: 2,
			borderColor: item.color
				? adjustColor(item.color, 0.6, 2)
				: DEFAULT_COLOR,
			backgroundColor: item.color
				? `${adjustColor(item.color, 0.2, 1.5)}30`
				: DEFAULT_COLOR + "1A",
			fill: "start",
		})),
	};

	return (
		<div className="aspect-[2/1]">
			<Line options={options} data={data} />
		</div>
	);
}
