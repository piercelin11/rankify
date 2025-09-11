"use client";

import { cn } from "@/lib/utils";
import { adjustColor } from "@/lib/utils/color.utils";
import React, { ReactNode, useState } from "react";

type StatsCardProps = {
	children: ReactNode;
	stats: string | number | null;
	subtitle: string;
	color?: string | null;
};

export default function StatsCard({
	children,
	stats,
	subtitle,
	color,
}: StatsCardProps) {
	const [isHover, setHover] = useState(false);
	return (
		<div
			className={cn(
				"stats-card bg-gradient-dark flex h-60 flex-col items-start justify-between transition-all duration-100 2xl:h-72",

			)}
			style={{
				backgroundImage: color
					? `radial-gradient(ellipse farthest-corner at top left, transparent 30%,${adjustColor(color, 0.1)}80 45%, ${adjustColor(color, 0.3, 1.5)}E6 75%, ${adjustColor(color, 0.55, 1.5)} 125%), linear-gradient(to bottom, rgb(9 9 11 / 1), rgb(9 9 11 / 1))`
					: "",
			}}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<div
				className={cn(
					"shadow-dent ml-auto hidden rounded-full bg-neutral-800 p-4 sm:block",
					{
						"bg-neutral-200 text-neutral-800": color,
					}
				)}
			>
				{children}
			</div>
			<div className="mt-auto space-y-2 overflow-hidden">
				<p
					className={
						"text-highlight flex items-center gap-1 font-numeric font-black"
					}
				>
					{stats ?? "no data"}
				</p>
				<p className="text-description">{subtitle}</p>
			</div>
		</div>
	);
}
