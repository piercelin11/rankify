"use client";

import { cn } from "@/lib/cn";
import { adjustColorLightness } from "@/lib/utils/colorAdjustment";
import React, { useEffect, useState } from "react";

export type BarData = {
	width: number;
	label: string;
	stats: number | string;
};

type PercentileBarsProps = {
	bars: BarData[];
	color?: string | null;
} & Omit<React.DelHTMLAttributes<HTMLDivElement>, "color">;

export default function PercentileBarsCard({
	bars,
	color,
	className,
}: PercentileBarsProps) {
	return (
		<div
			className={cn(
				"flex flex-1 flex-col justify-between gap-6 stats-card bg-gradient-dark sm:gap-0",
				`${className} py-10`
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
	const targetWidth =
		bar.width <= 1 ? bar.width * 100 : bar.width <= 100 ? bar.width : 100;

	useEffect(() => {
		const widthPercentage = `${targetWidth}%`;
		const timeout = setTimeout(() => {
			setAnimatedWidth(widthPercentage);
		}, 100);

		return () => clearTimeout(timeout);
	}, [targetWidth]);

	return (
		<div className="space-y-2">
			<div className="flex justify-between">
				<p className="font-numeric text-neutral-400">{bar.label}</p>
				<p className="font-numeric font-bold">{bar.stats}</p>
			</div>

			<div className="bg-neutral-800 relative h-2 w-full rounded-full">
				<div
					className="h-full rounded-full transition-all duration-1000 ease-in-out"
					style={{
						width: animatedWidth,
						background: color ? `linear-gradient(to right, ${adjustColorLightness(color, 0.45, 1.8)}, ${adjustColorLightness(color, 0.7, 1.8)})` : "#fef27a",
					}}
				></div>
			</div>
		</div>
	);
}
