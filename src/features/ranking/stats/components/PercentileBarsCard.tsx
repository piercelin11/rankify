"use client";

import { cn } from "@/lib/utils";
import { adjustColor } from "@/lib/utils/color.utils";
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
				"stats-card bg-gradient-dark flex flex-1 flex-col justify-between gap-6 sm:gap-0",
				`${className} py-10`
			)}
		>
			{bars.map((bar) => (
				<div key={bar.label} className="space-y-2">
					<div className="flex justify-between">
						<p className="font-numeric text-neutral-300">{bar.label}</p>
						<p className="font-numeric font-bold">{bar.stats}</p>
					</div>
					<PercentileBar width={bar.width} color={color} />
				</div>
			))}
		</div>
	);
}

type PercentileBarProps = {
	width: number;
	color?: string | null;
};

export function PercentileBar({ width, color }: PercentileBarProps) {
	const [animatedWidth, setAnimatedWidth] = useState("0%");
	const targetWidth = width <= 1 ? width * 100 : width <= 100 ? width : 100;

	useEffect(() => {
		const widthPercentage = `${targetWidth}%`;
		const timeout = setTimeout(() => {
			setAnimatedWidth(widthPercentage);
		}, 100);

		return () => clearTimeout(timeout);
	}, [targetWidth]);

	return (
		<div className="relative h-2 w-full rounded-full bg-neutral-800">
			<div
				className="h-full rounded-full transition-all duration-1000 ease-in-out"
				style={{
					width: animatedWidth,
					background: color
						? `linear-gradient(to right, ${adjustColor(color, 0.45, 1.8)}, ${adjustColor(color, 0.7, 1.8)})`
						: "#fef27a",
				}}
			></div>
		</div>
	);
}
