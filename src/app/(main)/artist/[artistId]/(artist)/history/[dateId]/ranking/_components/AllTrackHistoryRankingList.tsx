"use client";

import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { AlbumData, ArtistData } from "@/types/data";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Column, RankingHeader, RankingListItem } from "../../../../../../../../../features/ranking/display/components/RankingList";
import AchievementDisplay, {
	AchievementType,
} from "../../../../../../../../../features/ranking/stats/components/AchievementDisplay";
import useSortedAndFilteredRanking from "../../../../../../../../../features/ranking/display/hooks/useSortedAndFilteredRanking";
import RankingAlbumFilter from "../../../../../../../../../features/ranking/display/components/RankingAlbumFilter";
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import {
	FixedSizeList,
	ListChildComponentProps,
	ListOnScrollProps,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Button from "@/components/buttons/Button";
import useListScroll from "../../../../../../../../../features/ranking/display/hooks/useListScroll";

type TrackRankingListProps = {
	tracksRankings: TrackHistoryType[];
	albums: AlbumData[];
	artist: ArtistData | null;
	onBackHref: string;
};

export default function AllTrackHistoryRankingList({
	albums,
	tracksRankings,
	artist,
	onBackHref,
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
	const { listRefCallback, handleRowClick, handleListScroll } = useListScroll();

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
				{artist && (
					<Link href={onBackHref}>
						<Button className="gap-2 p-2" variant="outline" rounded>
							<Image
								className="rounded-full"
								src={artist?.img || ""}
								width={50}
								height={50}
								alt={`${artist?.name}`}
							/>
							<p className="text-sm">{artist?.name}</p>
							<ChevronRightIcon className="me-4" />
						</Button>
					</Link>
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
								key={itemHeight}
								className="overscroll-contain scrollbar-hidden"
								height={height}
								itemCount={sortedAndFilteredRankings.length}
								itemSize={itemHeight}
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
