"use client";

import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { adjustColor } from "@/lib/utils/color.utils";

ChartJS.register(ArcElement, Tooltip);

const options = {
	responsive: true,
	maintainAspectRatio: false,
	cutout: "70%",
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
};

type Props = {
	labels: string[];
	data: number[];
	colors: (string | null)[];
};

export default function DonutChart({ labels, data, colors }: Props) {
	const chartData = {
		labels,
		datasets: [
			{
				data,
				backgroundColor: colors.map((color) => adjustColor(color, 0.5, 2.5)),
				hoverBackgroundColor: colors.map(
					(color) => adjustColor(color, 0.55, 2.8)
				),
				borderColor: "#141415",
				borderWidth: 2.5,
				borderRadius: 5,
			},
		],
	};

	return (
		<div className="relative h-full w-full">
			<Doughnut data={chartData} options={options} />
		</div>
	);
}
