"use client";

import { TrackHistoryType } from "@/lib/data/ranking/history/getTrackRankingHistory";
import { TrackStatsType } from "@/lib/data/ranking/overall/getTrackStats";
import React from "react";
import RankChangeIconDisplay from "./RankChangeIconDisplay";
import AchievementDisplay from "./AchievementDisplay";
import RankingListGridLayout from "./RankingListGridLayout";
import { useSearchParams } from "next/navigation";
import { HeaderSortByType } from "./RankingListHeader";

export type RankingListItemProps = {
	data: TrackStatsType | TrackHistoryType;
	size?: number;
	length?: number;
	hasStats: boolean;
};

export function hasRankChange(
	data: TrackStatsType | TrackHistoryType
): data is TrackHistoryType {
	return data != null && "rankChange" in data;
}

export default function RankingListItem({
	data,
	size = 65,
	length = 1000,
	hasStats,
}: RankingListItemProps) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort") as HeaderSortByType | null;

	return (
		<RankingListGridLayout length={length}>
			<p className="mr-1 justify-self-end font-numeric text-lg font-medium tabular-nums text-zinc-400">
				{data.ranking}
			</p>
			<div className="flex items-center gap-3">
				{hasRankChange(data) && <RankChangeIconDisplay data={data} />}
				<img
					className="rounded"
					src={data.img || undefined}
					alt={data.name}
					width={size}
					height={size}
				/>
				<div>
					<p className="font-medium">{data.name}</p>
					<p className="text-sm text-zinc-500">{data.album?.name}</p>
				</div>
			</div>
			{!hasStats ? null : hasRankChange(data) ? (
				<div className="grid grid-cols-2 items-center justify-items-end font-numeric">
					<p
						className={sortQuery === "peak" ? "text-zinc-100" : "text-zinc-500"}
					>
						{data.peak}
					</p>
					<div className="col-start-2">
						<AchievementDisplay data={data} />
					</div>
				</div>
			) : (
				<div className="grid grid-cols-4 items-center justify-items-end font-numeric text-zinc-500">
					<p className={sortQuery === "peak" ? "text-zinc-100" : ""}>
						{data.peak}
					</p>
					<p className={sortQuery === "gap" ? "text-zinc-100" : ""}>
						{data.gap || null}
					</p>
					<p className={sortQuery === "totalChartRun" ? "text-zinc-100" : ""}>
						{data.totalChartRun}
					</p>
					<p className={sortQuery === "top10Count" ? "text-zinc-100" : ""}>
						{data.top10Count || null}
					</p>
				</div>
			)}
		</RankingListGridLayout>
	);
}
