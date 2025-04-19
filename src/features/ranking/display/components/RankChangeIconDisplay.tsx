import {
	RankDebutIcon,
	RankDownIcon,
	RankStableIcon,
	RankUpIcon,
} from "@/components/icon/StatsIcons";
import { cn } from "@/lib/cn";
import React from "react";

type RankChangeIconProps = {
	data: { rankChange?: number | null };
};

export default function RankChangeIconDisplay({ data }: RankChangeIconProps) {
	let result: "debut" | "stable" | "up" | "down";
	const iconSize = 14;

	const { rankChange } = data;

	if (rankChange === 0) result = "stable";
	else if (rankChange === null) result = "debut";
	else if (Number(rankChange) > 0) result = "up";
	else result = "down";

	return (
		<div
			className={cn("flex min-w-10 items-center gap-1 font-numeric text-sm", {
				"text-red-700": result === "down",
				"text-green-700": result === "up",
				"text-blue-900": result === "debut",
				"text-yellow-700": result === "stable",
			})}
		>
			<div>
				{result === "down" ? (
					<RankDownIcon size={iconSize} />
				) : result === "up" ? (
					<RankUpIcon size={iconSize} />
				) : result === "stable" ? (
					<RankStableIcon size={iconSize} />
				) : (
					<RankDebutIcon size={iconSize} />
				)}
			</div>
			<p className="font-medium text-sm">
				{typeof rankChange === "number" &&
					rankChange !== 0 &&
					Math.abs(rankChange)}
			</p>
		</div>
	);
}
