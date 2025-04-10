"use client";

import { ensureBrightness } from "@/lib/utils/adjustColor";
import React, { useEffect, useState } from "react";

export type BarData = {
	width: number;
	label: string;
	stats: number | string;
};

type HorizontalBarChartProps = {
	bars: BarData[];
	color?: string | null;
};

export default function HorizontalBarChart({
	bars,
	color,
}: HorizontalBarChartProps) {
	return (
		<div className="flex flex-1 flex-col justify-between rounded-3xl bg-zinc-900 p-8">
			{bars.map((bar) => (
				<Bar key={bar.label} bar={bar} color={color} />
			))}
		</div>
	);
}

type BarProps = {
	bar: BarData;
	color?: string | null;
};

export function Bar({ bar, color }: BarProps) {
	const [animatedWidth, setAnimatedWidth] = useState("0%");
	const width =
		bar.width <= 1 ? bar.width * 100 : bar.width <= 100 ? bar.width : 100;

	useEffect(() => {
		const widthPercentage = `${width}%`;
		const timeout = setTimeout(() => {
			setAnimatedWidth(widthPercentage);
		}, 100);

		return () => clearTimeout(timeout);
	}, [bar]);

	return (
		<div className="space-y-2">
			<div className="flex justify-between">
				<p className="font-numeric text-zinc-300">{bar.label}</p>
				<p>{bar.stats}</p>
			</div>

			<div className="relative h-2 w-full rounded-full bg-zinc-750">
				<div
					className="h-full rounded-full transition-all duration-1000 ease-in-out"
					style={{
						width: animatedWidth,
						backgroundColor: color ? ensureBrightness(color) : "#fef27a",
					}}
				></div>
			</div>
		</div>
	);
}
