"use client";

import { cn } from "@/lib/cn";
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
} & Omit<React.DelHTMLAttributes<HTMLDivElement>, "color">;

export default function HorizontalBarChart({
	bars,
	color,
	className,
}: HorizontalBarChartProps) {
	return (
		<div
			className={cn(
				"flex flex-1 flex-col justify-between rounded-2xl bg-zinc-900 gap-6 p-5 sm:gap-0 2xl:p-8",
				className
			)}
		>
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
