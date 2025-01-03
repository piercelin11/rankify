"use client";

import { TrackStatsType } from "@/lib/data/ranking/overview/getTracksStats";
import React, { useEffect, useState } from "react";
import RankingHeader, { HeaderSortByType } from "./RankingHeader";
import RankingListItem from "./RankingListItem";
import { useSearchParams } from "next/navigation";
import { TrackHistoryType } from "@/lib/data/ranking/history/getTracksRankingHistory";
import RankingAlbumFilterDropdown from "@/components/menu/RankingAlbumFilterDropdown";
import { AlbumData } from "@/types/data";

type TrackRankingChartProps = {
	title: string;
	datas: TrackStatsType[] | TrackHistoryType[];
};

export function hasRankChange(
	datas: TrackStatsType[] | TrackHistoryType[]
): datas is TrackHistoryType[] {
	return datas[0] != null && "rankChange" in datas[0];
}

export default function TrackRankingChart({ title, datas }: TrackRankingChartProps) {
	const searchParams = useSearchParams();
	const album = searchParams.get("album");
	const sort = searchParams.get("sort") as HeaderSortByType | null;
	const order = searchParams.get("order") as "asc" | "desc" | null;

	const isHistoryType = hasRankChange(datas);

	const albums = datas
		.reduce((acc: AlbumData[], cur) => {
			const exisitingAlbum = acc.find((data) => data.id === cur.albumId);
			if (!exisitingAlbum && cur.album) acc.push(cur.album);

			return acc;
		}, [])
		.sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());

	function sortRanking() {
		let sortedDatas: TrackStatsType[] | TrackHistoryType[] = [];

		if (sort) {
			if (sort === "peak") {
				if (order === "asc")
					sortedDatas = datas.sort((a, b) => a[sort] - b[sort]);
				else sortedDatas = datas.sort((a, b) => b[sort] - a[sort]);
			}
			if (!isHistoryType) {
				if (order === "asc")
					sortedDatas = datas
						.filter((data) => data[sort])
						.sort((a, b) => b[sort]! - a[sort]!);
				else
					sortedDatas = datas
						.filter((data) => data[sort])
						.sort((a, b) => a[sort]! - b[sort]!);
			}
		} else sortedDatas = datas.sort((a, b) => a.ranking - b.ranking);

		if (album) return sortedDatas.filter((data) => data.albumId === album);
		else return sortedDatas;
	}

	const filteredDatas = sortRanking();
	const hasStats = !isHistoryType
		? !!(datas as TrackStatsType[]).filter((data) => data.loggedCount > 2)
				.length
		: true;

	return (
		<div>
			<div className="mb-10 flex justify-between items-center">
				<RankingAlbumFilterDropdown menuData={albums} />
				<p className="text-zinc-500">{title}</p>
			</div>
			<RankingHeader data={datas[0]} hasStats={hasStats} />
			{filteredDatas?.map((track) => (
				<RankingListItem data={track} key={track.id} hasStats={hasStats} />
			))}
		</div>
	);
}
