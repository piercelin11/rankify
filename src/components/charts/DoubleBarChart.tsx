"use client";

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
import { adjustColor } from "@/lib/utils/color.utils";
import { toAcronym } from "@/lib/utils";
import { DEFAULT_COLOR } from "@/constants";

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
				color: "#27272a00",
			},
		},
	},
	barPercentage: 0.5,
	categoryPercentage: 0.8,
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

type DatasetType = {
	label: string;
	data: number[];
	color?: string;
	hoverColor: string[];
};

type Props = {
	labels: string[];
	datasets: DatasetType[];
};

export default function DoubleBarChart({ labels, datasets }: Props) {
	const data = {
		labels: labels.map((label) => toAcronym(label)),
		datasets: datasets.map((item) => ({
			label: item.label,
			data: item.data,
			borderWidth: 1.5,
			borderColor: item.color || DEFAULT_COLOR,
			backgroundColor: item.color || DEFAULT_COLOR,
			hoverBackgroundColor: item.hoverColor.map(
				(color) => adjustColor(color, 0.4, 1.5) + "80"
			),
			hoverBorderColor: item.hoverColor.map((color) =>
				adjustColor(color, 0.6, 2)
			),
		})),
	};

	return (
		<div className="aspect-[2/1]">
			<Bar options={options} data={data} />
		</div>
	);
}
