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
			className={cn("flex flex-1 flex-col items-start gap-10 rounded-2xl p-5 2xl:p-8 2xl:gap-20", {
				"bg-neutral-900": !color,
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
				className={cn("rounded-full bg-neutral-800 p-4 hidden sm:block", {
					"bg-neutral-100 text-neutral-800": color,
				})}
			>
				{children}
			</div>
			<div className="space-y-2">
				<p className="font-numeric text-3xl font-black">{stats ?? "no data"}</p>
				<p className={cn("text-neutral-500", {
					"text-neutral-300": color,
				})}>{subtitle}</p>
			</div>
		</div>
	);
}
