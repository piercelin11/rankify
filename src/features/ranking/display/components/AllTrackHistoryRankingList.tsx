"use client";

import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { AlbumData } from "@/types/data";
import React, { useMemo } from "react";
import { Column, RankingHeader, RankingListItem } from "./RankingList";
import AchievementDisplay, {
	AchievementType,
} from "../../stats/components/AchievementDisplay";
import useSortedAndFilteredRanking from "../hooks/useSortedAndFilteredRanking";
import RankingAlbumFilter from "./RankingAlbumFilter";
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

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

				<div className="relative h-[calc(100vh-228px)] w-full overflow-auto scrollbar-hidden 2xl:h-[calc(100vh-280px)]">
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
		</div>
	);
}

type RowData = {
	items: TrackHistoryType[];
	columns: Column<TrackHistoryType>[];
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
