"use client";

import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import React, { useMemo } from "react";
import { AlbumData, ArtistData } from "@/types/data.types";
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Image from "next/image";
import useSortedAndFilteredRanking from "@/features/ranking/display/hooks/useSortedAndFilteredRanking";
import useListScroll from "@/features/ranking/display/hooks/useListScroll";
import {
	Column,
	RankingHeader,
	RankingListItem,
} from "@/features/ranking/display/components/RankingList";
import AchievementDisplay, {
	AchievementType,
} from "@/features/ranking/stats/components/AchievementDisplay";
import RankingAlbumFilter from "@/features/ranking/display/components/RankingAlbumFilter";
import { cn } from "@/lib/cn";

type AllTrackOverviewRankingListProps = {
	tracksRankings: TrackStatsType[];
	albums: AlbumData[];
	artist: ArtistData | null;
	caption?: string;
};

export const ITEM_HEIGHT = 76;

export default function AllTrackOverviewRankingList({
	tracksRankings,
	albums,
	artist,
	caption,
}: AllTrackOverviewRankingListProps) {
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

	const columns: Column<TrackStatsType>[] = [
		{
			key: "averageRanking",
			header: "avg",
			onClick: () => handleHeaderClick("averageRanking"),
		},
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
		<>
			<div className="flex items-center justify-between">
				<RankingAlbumFilter
					dropdownOptions={dropdownOptions}
					selectedAlbum={albumIdFilter && albumsMap.get(albumIdFilter)?.name}
				/>
				{artist && (
					<div className="flex items-center gap-2 rounded-full bg-neutral-600/20 p-2 text-neutral-500">
						<Image
							className="rounded-full"
							src={artist?.img || ""}
							width={30}
							height={30}
							alt={`${artist?.name}`}
						/>
						<p className="text-sm">{artist?.name}</p>
						{caption && (
							<>
								•<p className="me-2 text-sm">{caption}</p>
							</>
						)}
					</div>
				)}
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
		</>
	);
}

type RowData = {
	items: TrackStatsType[];
	columns: Column<TrackStatsType>[];
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
