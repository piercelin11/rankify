"use client";

import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { AlbumData } from "@/types/data";
import React, { useMemo } from "react";
import {
	Column,
	RankingHeader,
	RankingListItem,
} from "./RankingList";
import AchievementDisplay, {
	AchievementType,
} from "../../stats/components/AchievementDisplay";
import useSortedAndFilteredRanking from "../hooks/useSortedAndFilteredRanking";
import RankingAlbumFilter from "./RankingAlbumFilter";

type TrackRankingListProps = {
	tracksRankings: TrackHistoryType[];
	albums: AlbumData[];
	title: string;
};

export default function AllTrackHistoryRankingList({
	albums,
	tracksRankings,
	title,
}: TrackRankingListProps) {
	const {
		sortedAndFilteredRankings,
		handleHeaderClick,
		dropdownOptions,
		albumIdFilter,
		sortKey,
		sortOrder,
	} = useSortedAndFilteredRanking(tracksRankings, albums);

	const albumsMap = useMemo(
		() => new Map(albums.map((album) => [album.id, album])),
		[albums]
	);
	const columns: Column<TrackHistoryType>[] = [
		{
			key: "peak",
			header: "peak",
			onClick: () => handleHeaderClick("peak"),
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
		<div>
			<div className="mb-10 flex items-center justify-between">
				<RankingAlbumFilter
					dropdownOptions={dropdownOptions}
					selectedAlbum={albumIdFilter && albumsMap.get(albumIdFilter)?.name}
				/>
				<p className="hidden text-neutral-500 sm:block">{title}</p>
			</div>
			<section>
				<RankingHeader
					columns={columns}
					selectedHeader={String(sortKey)}
					sortOrder={sortOrder}
				/>

				{sortedAndFilteredRankings.map((row) => (
					<RankingListItem key={row.id} data={row} columns={columns} />
				))}
			</section>
		</div>
	);
}
