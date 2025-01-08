"use client";

import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import React, { ReactNode } from "react";
import RankChangeIconDisplay from "./RankChangeIconDisplay";
import AchievementDisplay from "./AchievementDisplay";
import { useSearchParams } from "next/navigation";
import { HeaderSortByType } from "./RankingHeader";
import Link from "next/link";
import { cn } from "@/lib/cn";

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
		<Link href={`/artist/${data.artistId}/track/${data.id}`}>
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
						{data.isLatest && (
							<p
								className={
									sortQuery === "peak" ? "text-zinc-100" : "text-zinc-500"
								}
							>
								{data.peak}
							</p>
						)}
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
		</Link>
	);
}

type RankingListGridLayoutProps = {
	children: [ReactNode, ReactNode, ReactNode];
	length?: number;
	type?: "header" | "item";
};

export function RankingListGridLayout({
	length = 1000,
	children,
	type = "item",
}: RankingListGridLayoutProps) {
	const numberWidth = length < 10 ? 25 : length < 100 ? 35 : 45;
	return (
		<div
			className={cn(
				"grid cursor-pointer select-none items-center gap-3 rounded border-b border-zinc-900 pl-2 pr-6 py-3",
				{
					"grid-cols-[45px,_3fr,_2fr]": numberWidth === 45,
					"grid-cols-[35px,_3fr,_2fr]": numberWidth === 35,
					"grid-cols-[25px,_3fr,_2fr]": numberWidth === 25,
					"mb-8": type === "header",
					"hover:bg-zinc-900": type !== "header",
				}
			)}
		>
			{children}
		</div>
	);
}