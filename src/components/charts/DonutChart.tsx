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
import { adjustSaturation } from "@/lib/utils";

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
	ids: string[];
	hoveredId?: string | null;
	onHoveredIdChange?: (id: string | null) => void;
};

export default function DonutChart({
	labels,
	data,
	colors,
	ids,
	hoveredId,
	onHoveredIdChange,
}: Props) {
	const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(
		null
	);

	let controlledIndex: number | null | undefined;
	if (hoveredId === undefined) {
		controlledIndex = undefined;
	} else if (hoveredId === null) {
		controlledIndex = null;
	} else {
		const index = ids.indexOf(hoveredId);
		controlledIndex = index === -1 ? null : index;
	}
	const hoveredIndex = controlledIndex ?? localHoveredIndex;

	const backgroundColor = colors.map((color, index) =>
		hoveredIndex === null
			? getDefaultColorForIndex(index, data.length)
			: hoveredIndex === index
				? color
					? adjustSaturation(color, 2.5)
					: DEFAULT_COLOR
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
			const index = elements[0]?.index ?? null;
			setLocalHoveredIndex(index);
			onHoveredIdChange?.(index === null ? null : ids[index]);
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
			onMouseLeave={() => {
				setLocalHoveredIndex(null);
				onHoveredIdChange?.(null);
			}}
		>
			<Doughnut data={chartData} options={options} />
		</div>
	);
}
