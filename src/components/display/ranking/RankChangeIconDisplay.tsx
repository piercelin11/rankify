import {
	RankDebutIcon,
	RankDownIcon,
	RankStableIcon,
	RankUpIcon,
} from "@/components/icon/StatsIcons";
import { cn } from "@/lib/cn";
import { TrackHistoryType } from "@/lib/data/ranking/history/getTrackRankingHistory";
import { TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";
import React from "react";

type RankChangeIconProps = {
	data: TrackHistoryType;
};

export default function RankChangeIconDisplay({ data }: RankChangeIconProps) {
	let result: "debut" | "stable" | "up" | "down";
	const iconSize = 16;

	const {rankChange} = data;

	if (rankChange === 0) result = "stable";
	else if (rankChange === null) result = "debut";
	else if (rankChange > 0) result = "up";
	else result = "down";
 
	return (
		<div
			className={cn("flex min-w-10 items-center gap-1 font-numeric text-sm", {
				"text-red-800/80": result === "down",
				"text-green-900": result === "up",
				"text-blue-900/60": result === "debut",
				"text-yellow-700": result === "stable"
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
			<p className="font-medium">{typeof rankChange === "number" && rankChange !== 0 && Math.abs(rankChange)}</p>
		</div>
	);
}
