"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import RankingAlbumFilter from "./RankingAlbumFilter";
import { AlbumData } from "@/types/data";
import RankingList, {
	Column,
	RankingListDataTypeExtend,
} from "./RankingList";
import {
	TrackHistoryType,
} from "@/lib/database/ranking/history/getTracksRankingHistory";
import AchievementDisplay, { AchievementType } from "@/features/ranking-stats/components/AchievementDisplay";

type TrackRankingListProps<T> = {
	data: T[];
	albums: AlbumData[];
	columns: Column<T>[];
	title: string;
};

export default function TrackRankingList<
	T extends RankingListDataTypeExtend,
>({ albums, data, columns, title }: TrackRankingListProps<T>) {
	const searchParams = useSearchParams();
	const album = searchParams.get("album");
	const sort = searchParams.get("sort") as keyof T | null;
	const order = searchParams.get("order") as "asc" | "desc" | null;

	function sortRanking() {
		let sortedDatas;

		if (sort) {
			if (order === "asc") {
				sortedDatas = data
					.filter((data) => data[sort] !== null)
					.sort((a, b) => {
						if (typeof a[sort] === "string" || typeof b[sort] === "string") {
							return (b[sort] ? 1 : 0) - (a[sort] ? 1 : 0);
						}

						return Number(a[sort]) - Number(b[sort]);
					});
			} else {
				sortedDatas = data
					.filter((data) => data[sort] !== null)
					.sort((a, b) => {
						if (typeof a[sort] === "string" || typeof b[sort] === "string") {
							return (a[sort] ? 1 : 0) - (b[sort] ? 1 : 0);
						}

						return Number(b[sort]) - Number(a[sort]);
					});
			}
		} else {
			sortedDatas = data.sort((a, b) => a.ranking - b.ranking);
		}

		if (album) {
			sortedDatas = sortedDatas.filter((data) => data.albumId === album);
		}

		return sortedDatas;
	}

	const filteredDatas = sortRanking();

	return (
		<div>
			<div className="mb-10 flex items-center justify-between">
				<RankingAlbumFilter menuData={albums} />
				<p className="text-zinc-500 hidden sm:block">{title}</p>
			</div>
			<RankingList data={filteredDatas} columns={columns} />
		</div>
	);
}

export function HistoryTrackRankingChart({
	albums,
	data,
	title,
}: Omit<TrackRankingListProps<TrackHistoryType>, "columns">) {
	const columns: Column<TrackHistoryType>[] = [
		{
			key: "peak",
			header: "peak",
		},
		{
			key: "achievement",
			header: "achievement",
			render: (value) => (
				<AchievementDisplay
					achievement={value as AchievementType | undefined}
				/>
			),
		},
	];
	return (
		<TrackRankingList
			columns={columns}
			data={data}
			albums={albums}
			title={title}
		/>
	);
}