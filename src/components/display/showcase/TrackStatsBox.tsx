import { cn } from "@/lib/cn";
import React, { ReactNode } from "react";

type TrackStatsBoxProps = {
	children: ReactNode;
	stats: string | number | null;
	subtitle: string;
	color?: string | null;
};

export default function TrackStatsBox({
	children,
	stats,
	subtitle,
	color,
}: TrackStatsBoxProps) {
	return (
		<div
			className={cn("flex flex-1 flex-col items-start gap-20 rounded-3xl p-8", {
				"bg-zinc-900": !color,
			})}
			style={
				color
					? {
							background: `linear-gradient(120deg, #00000000 0%, ${color}35 50%, ${color}BF 120%), linear-gradient(160deg, #00000000 0%, ${color}30 60%, ${color}BF 120%)`,
						}
					: undefined
			}
		>
			<div
				className={cn("rounded-full bg-zinc-750 p-4", {
					"bg-zinc-100 text-zinc-800": color,
				})}
			>
				{children}
			</div>
			<div className="space-y-2">
				<p className="font-numeric text-3xl font-black">{stats ?? "no data"}</p>
				<p className={cn("text-zinc-500", {
					"text-zinc-300": color,
				})}>{subtitle}</p>
			</div>
		</div>
	);
}
