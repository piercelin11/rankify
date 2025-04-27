"use client";

import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import React, { useMemo } from "react";
import {
	Column,
	RankingHeader,
	RankingListItem,
} from "./RankingList";
import { AlbumData } from "@/types/data";
import RankingAlbumFilter from "./RankingAlbumFilter";
import useSortedAndFilteredRanking from "../hooks/useSortedAndFilteredRanking";

type AllTrackOverviewRankingListProps = {
	tracksRankings: TrackStatsType[];
	albums: AlbumData[];
	title: string;
};

export default function AllTrackOverviewRankingList({
	tracksRankings,
	albums,
	title,
}: AllTrackOverviewRankingListProps) {
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

	const columns: Column<TrackStatsType>[] = [
		{
			key: "peak",
			header: "peak",
			onClick: () => handleHeaderClick("peak"),
		},
		{
			key: "gap",
			header: "gap",
			onClick: () => handleHeaderClick("gap"),
		},
		{
			key: "averageRanking",
			header: "avg",
			onClick: () => handleHeaderClick("averageRanking"),
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
