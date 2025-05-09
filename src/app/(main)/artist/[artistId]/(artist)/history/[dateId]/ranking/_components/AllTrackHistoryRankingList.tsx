"use client";

import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { AlbumData, ArtistData } from "@/types/data";
import React, { useMemo } from "react";
import {
	Column,
	RankingHeader,
	RankingListItem,
} from "@/features/ranking/display/components/RankingList";
import AchievementDisplay, {
	AchievementType,
} from "@/features/ranking/stats/components/AchievementDisplay";
import useSortedAndFilteredRanking from "@/features/ranking/display/hooks/useSortedAndFilteredRanking";
import RankingAlbumFilter from "@/features/ranking/display/components/RankingAlbumFilter";
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Image from "next/image";
import useListScroll from "@/features/ranking/display/hooks/useListScroll";
import { cn } from "@/lib/cn";
import { ITEM_HEIGHT } from "@/app/(main)/artist/[artistId]/(artist)/overview/[rangeSlug]/ranking/_components/AllTrackOverviewRankingList";

type TrackRankingListProps = {
	tracksRankings: TrackHistoryType[];
	albums: AlbumData[];
	artist: ArtistData | null;
};

export default function AllTrackHistoryRankingList({
	albums,
	tracksRankings,
	artist,
}: TrackRankingListProps) {
	const {
		sortedAndFilteredRankings,
		handleHeaderClick,
		dropdownOptions,
		albumIdFilter,
		sortKey,
		sortOrder,
	} = useSortedAndFilteredRanking(tracksRankings, albums);
	const { isScrolled, listRefCallback, handleRowClick, handleListScroll } =
		useListScroll();

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
			header: "achv",
			render: (value) => (
				<AchievementDisplay
					achievements={value as AchievementType[] | undefined}
				/>
			),
			onClick: () => handleHeaderClick("achievement"),
		},
	];

	return (
		<div>
			<div className="mb-10 flex items-center justify-between">
				<RankingAlbumFilter
					dropdownOptions={dropdownOptions}
					selectedAlbum={albumIdFilter && albumsMap.get(albumIdFilter)?.name}
				/>
				{artist && (
					<div className="flex items-center gap-2 rounded-full bg-neutral-500/20 p-2">
						<Image
							className="rounded-full"
							src={artist?.img || ""}
							width={30}
							height={30}
							alt={`${artist?.name}`}
						/>
						<p className="me-2 text-sm text-neutral-400">{artist?.name}</p>
					</div>
				)}
			</div>
			<section>
				<RankingHeader
					columns={columns}
					selectedHeader={String(sortKey)}
					sortOrder={sortOrder}
				/>

				<div className="h-virtualized-ranking relative w-full">
					<AutoSizer>
						{({ height, width }) => (
							<FixedSizeList
								ref={listRefCallback}
								key={ITEM_HEIGHT}
								className={cn("overscroll-contain scrollbar-hidden", {
									hidden: !isScrolled,
								})}
								height={height}
								itemCount={sortedAndFilteredRankings.length}
								itemSize={ITEM_HEIGHT}
								width={width}
								itemData={{
									items: sortedAndFilteredRankings,
									columns: columns,
									sortKey: String(sortKey),
									handleRowClick: handleRowClick,
								}}
								overscanCount={5}
								onScroll={handleListScroll}
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
	handleRowClick: () => void;
};

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
	const rowData = data.items[index];
	const columns = data.columns;
	const sortKey = data.sortKey;
	const handleRowClick = data.handleRowClick;

	if (!rowData) {
		return null;
	}

	return (
		<div style={style} onClick={handleRowClick}>
			<RankingListItem
				data={rowData}
				columns={columns}
				selectedHeader={String(sortKey)}
			/>
		</div>
	);
}
