import { cn } from "@/lib/cn";
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
				"flex flex-1 flex-col items-start gap-10 stats-card 2xl:gap-20",
			)}
		>
			<div
				className={cn("hidden rounded-full bg-neutral-800 p-4 sm:block", {
					"bg-neutral-100 text-neutral-800": color,
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
