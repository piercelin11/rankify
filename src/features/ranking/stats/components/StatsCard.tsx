
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
				"stats-card flex flex-1 flex-col items-start gap-10 2xl:gap-20 duration-100"
			)}
			style={{
				backgroundImage: color
					? `radial-gradient(ellipse farthest-corner at top left, rgb(9 9 11 / 0.7) 30%, ${adjustColorLightness(color, 0.2)} 70%, ${adjustColorLightness(color, 0.5)} 110%), linear-gradient(to bottom, rgb(9 9 11 / 0.35), rgb(9 9 11 / 1))`
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
			<div className="space-y-2">
				<p className="text-highlight font-numeric">{stats ?? "no data"}</p>
				<p className="text-description">{subtitle}</p>
			</div>
		</div>
	);
}
