"use client";

import { TrackStatsType } from "@/lib/data/ranking/overview/getTracksStats";
import React, { useEffect, useState } from "react";
import RankingHeader, { HeaderSortByType } from "./RankingHeader";
import RankingListItem from "./RankingListItem";
import { useSearchParams } from "next/navigation";
import { TrackHistoryType } from "@/lib/data/ranking/history/getTracksRankingHistory";

type TrackRankingChartProps = {
	datas: TrackStatsType[] | TrackHistoryType[];
};

export function hasRankChange(
	datas: TrackStatsType[] | TrackHistoryType[]
): datas is TrackHistoryType[] {
	return datas[0] != null && "rankChange" in datas[0];
}

export default function TrackRankingChart({ datas }: TrackRankingChartProps) {
	const searchParams = useSearchParams();
	const sort = searchParams.get("sort") as HeaderSortByType | null;
	const order = searchParams.get("order") as "asc" | "desc" | null;

	const isHistoryType = hasRankChange(datas);

	function sortRanking() {
		if (sort) {
			if (sort === "peak") {
				if (order === "asc") return datas.sort((a, b) => a[sort] - b[sort]);
				else return datas.sort((a, b) => b[sort] - a[sort]);
			}
			if (!isHistoryType) {
				if (order === "asc")
					return datas
						.filter((data) => data[sort])
						.sort((a, b) => b[sort]! - a[sort]!);
				else
					return datas
						.filter((data) => data[sort])
						.sort((a, b) => a[sort]! - b[sort]!);
			}
		} else return datas.sort((a, b) => a.ranking - b.ranking);
	}

	const filteredDatas = sortRanking();
	const hasStats = !isHistoryType ? !!(datas as TrackStatsType[]).filter((data) => data.loggedCount > 2).length : true;

	return (
		<div>
			<RankingHeader data={datas[0]} hasStats={hasStats} />
			{filteredDatas?.map((track) => (
				<RankingListItem data={track} key={track.id} hasStats={hasStats} />
			))}
		</div>
	);
}
