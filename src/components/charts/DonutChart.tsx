"use client";

import { useState } from "react";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	type ActiveElement,
	type ChartEvent,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import colorConvert from "color-convert";
import { DEFAULT_COLOR, MUTED_COLOR } from "@/constants";

ChartJS.register(ArcElement, Tooltip);

const [DEFAULT_R, DEFAULT_G, DEFAULT_B] = colorConvert.hex.rgb(
	DEFAULT_COLOR.slice(1)
);

// 依排名遞減不透明度，最低不低於原色的 20%
function getDefaultColorForIndex(index: number, total: number): string {
	const ratio = Math.max((total - index) / total, 0.05);
	return `rgba(${DEFAULT_R}, ${DEFAULT_G}, ${DEFAULT_B}, ${ratio})`;
}

type Props = {
	labels: string[];
	data: number[];
	colors: (string | null)[];
};

export default function DonutChart({ labels, data, colors }: Props) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const backgroundColor = colors.map((color, index) =>
		hoveredIndex === null
			? getDefaultColorForIndex(index, data.length)
			: hoveredIndex === index
				? (color ?? DEFAULT_COLOR)
				: MUTED_COLOR
	);

	const chartData = {
		labels,
		datasets: [
			{
				data,
				backgroundColor,
				borderColor: "#181716",
				borderWidth: 3.5,
				borderRadius: 5,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: "50%",
		animation: {
			duration: 500,
		},
		onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
			setHoveredIndex(elements[0]?.index ?? null);
		},
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

	return (
		<div
			className="relative h-full w-full"
			onMouseLeave={() => setHoveredIndex(null)}
		>
			<Doughnut data={chartData} options={options} />
		</div>
	);
}
