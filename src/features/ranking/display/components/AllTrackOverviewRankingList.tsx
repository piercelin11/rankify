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
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

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
	const isMobole = useMediaQuery("max", 660);
	const itemHeight = isMobole ? 72 : 89;
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
		<>
			<div className="flex items-center justify-between">
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
				<div className="h-virtualized-ranking relative w-full overflow-auto scrollbar-hidden">
					<AutoSizer>
						{({ height, width }) => (
							<FixedSizeList
								key={itemHeight}
								className="scrollbar-hidden"
								height={height}
								itemCount={sortedAndFilteredRankings.length}
								itemSize={itemHeight}
								width={width}
								itemData={{
									items: sortedAndFilteredRankings,
									columns: columns,
									sortKey: String(sortKey),
								}}
								overscanCount={5}
							>
								{Row}
							</FixedSizeList>
						)}
					</AutoSizer>
				</div>
			</section>
		</>
	);
}

type RowData = {
	items: TrackStatsType[];
	columns: Column<TrackStatsType>[];
	sortKey: string | null;
};

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
	const rowData = data.items[index];
	const columns = data.columns;
	const sortKey = data.sortKey;

	if (!rowData) {
		return null;
	}

	return (
		<div style={style}>
			<RankingListItem
				data={rowData}
				columns={columns}
				selectedHeader={String(sortKey)}
			/>
		</div>
	);
}
