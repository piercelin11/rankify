import { cn } from "@/lib/cn";
import { adjustColorLightness } from "@/lib/utils/colorAdjustment";
import React, { ReactNode } from "react";

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
	return (
		<div
			className={cn(
				"stats-card bg-gradient-dark flex h-60 flex-col items-start justify-between duration-100 sm:h-72"
			)}
			style={{
				backgroundImage: color
					? `radial-gradient(ellipse farthest-corner at top left, transparent 30%,${adjustColorLightness(color, 0.1)}80 45%, ${adjustColorLightness(color, 0.2)}E6 70%, ${adjustColorLightness(color, 0.55)} 125%), linear-gradient(to bottom, rgb(9 9 11 / 1), rgb(9 9 11 / 1))`
					: "",
			}}
		>
			<div
				className={cn("hidden rounded-full bg-neutral-700 p-4 sm:block", {
					"bg-neutral-200 text-neutral-800": color,
				})}
			>
				{children}
			</div>
			<div className="mt-auto space-y-2 overflow-hidden">
				<p className="text-highlight font-numeric">{stats ?? "no data"}</p>
				<p className="text-description">{subtitle}</p>
			</div>
		</div>
	);
}
