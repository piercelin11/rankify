import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import React from "react";

type AchievementDisplayProps = {
	data: TrackHistoryType;
};

export default function AchievementDisplay({ data }: AchievementDisplayProps) {
	function getAchievement() {
		if (!data.rankChange) return;
		else if (data.peak === data.ranking && data.isLatest)
			return (
				<div className="flex items-center gap-2 rounded-md border border-lime-500 p-3 text-sm text-lime-500">
					<StarFilledIcon />
					<p>Hit Peak</p>
				</div>
			);
		else if (data.rankChange > data.countSongs / 4)
			return (
				<div className="flex items-center gap-2 rounded-md border border-green-500 p-3 text-sm text-green-500">
					<ArrowUpIcon />
					<p>Big Jump</p>
				</div>
			);
		if (data.rankChange < -(data.countSongs / 4))
			return (
				<div className="flex items-center gap-2 rounded-md border border-red-500 p-3 text-sm text-red-500">
					<ArrowDownIcon />
					<p>Big Drop</p>
				</div>
			);
	}

	return <div>{getAchievement()}</div>;
}
