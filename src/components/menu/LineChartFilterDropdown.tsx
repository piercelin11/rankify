"use client";

import { DEFAULT_COLOR } from "@/config/variables";
import { cn } from "@/lib/cn";
import { TrackStatsType } from "@/lib/data/ranking/overview/getTracksStats";
import { ensureBrightness } from "@/lib/utils/adjustColor";
import { AlbumData } from "@/types/data";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

type LineChartFilterDropdownProps = {
	defaultData: TrackStatsType;
	allTracksStats: TrackStatsType[];
};

export default function LineChartFilterDropdown({
	defaultData,
	allTracksStats,
}: LineChartFilterDropdownProps) {
	const [isOpen, setOPen] = useState(false);
	const [filterByAlbumId, setFilterByAlbumId] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const comparisonQuery = searchParams.getAll("comparison");

	const tracks = allTracksStats.sort((a, b) => {
		if (!b.album || !a.album) return b.album ? 1 : a.album ? -1 : 0;
		if (a.album.id !== b.album.id) {
			return b.album.releaseDate.getTime() - a.album.releaseDate.getTime();
		}
		if (!a.trackNumber || !b.trackNumber)
			return b.trackNumber ? 1 : a.trackNumber ? -1 : 0;
		if (a.album.id === b.album.id) {
			return a.trackNumber - b.trackNumber;
		}
		return 0;
	});

	const albums = allTracksStats
		.reduce((acc: AlbumData[], cur) => {
			const exisitingAlbum = acc.find((data) => data.id === cur.albumId);
			if (!exisitingAlbum && cur.album) acc.push(cur.album);

			return acc;
		}, [])
		.sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());

	function handleAlbumFilter(albumId: string) {
		if (albumId === filterByAlbumId) setFilterByAlbumId(null);
		else setFilterByAlbumId(albumId);
	}

	function handleMenuItemClick(trackId: string) {
		const params = new URLSearchParams(searchParams);
		if (comparisonQuery.includes(trackId)) return null;
		if (trackId === defaultData.id) return null;
		params.append("comparison", trackId);
		setOPen(false);
		window.history.replaceState(null, "", `?${params.toString()}`);
	}

	function handleTagDelete(trackId: string) {
		const params = new URLSearchParams(searchParams);
		const newQuery = comparisonQuery.filter((query) => query !== trackId);
		params.delete("comparison");
		for (const query of newQuery) {
			params.append("comparison", query);
		}
		window.history.replaceState(null, "", `?${params.toString()}`);
	}

	return (
		<div className="relative select-none">
			<div
				className="flex justify-between gap-3 rounded-md bg-zinc-900 p-3"
				onClick={() => setOPen((prev) => !prev)}
			>
				<div className="scrollbar-hidden flex w-[580px] gap-2 overflow-auto">
					<TrackTag data={defaultData} isDefault={true} />
					{comparisonQuery.map((query) => {
						const track = tracks.find((track) => track.id === query)!;
						return (
							<TrackTag
								key={track.id}
								data={track}
								onClick={() => handleTagDelete(track.id)}
							/>
						);
					})}
				</div>
				<ChevronDownIcon
					className={cn("self-center text-zinc-400 transition ease-in-out", {
						"rotate-180 transform text-zinc-600": isOpen,
					})}
					width={18}
					height={18}
				/>
			</div>
			<div
				className={cn(
					"scrollbar-hidden absolute max-h-96 w-full overflow-auto rounded-md bg-zinc-900 opacity-0 transition ease-in-out",
					{
						"translate-y-3 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
				<div className="sticky top-0 flex gap-2 overflow-auto bg-zinc-900/90 px-3 py-6">
					{albums.map((album) => (
						<AlbumTag
							key={album.id}
							data={album}
							onClick={() => handleAlbumFilter(album.id)}
							selectedAlbumId={filterByAlbumId}
						/>
					))}
				</div>
				{tracks
					.filter((track) => {
						if (filterByAlbumId) return track.albumId === filterByAlbumId;
						else return track;
					})
					.map((track) => (
						<MenuItem
							key={track.id}
							data={track}
							onClick={() => handleMenuItemClick(track.id)}
						/>
					))}
			</div>
		</div>
	);
}

function TrackTag({
	data,
	isDefault = false,
	onClick,
}: {
	data: TrackStatsType;
	isDefault?: boolean;
	onClick?: () => void;
}) {
	return (
		<div
			className="flex flex-none flex-grow-0 items-center gap-1 rounded px-3 py-2 text-zinc-100"
			style={{
				backgroundColor:
					ensureBrightness(data.album?.color ?? DEFAULT_COLOR) + "90",
			}}
		>
			{!isDefault && (
				<div
					onClick={(e) => {
						e.stopPropagation();
						if (onClick) onClick();
					}}
					className="-ml-1"
				>
					<Cross2Icon />
				</div>
			)}
			{data.name}
		</div>
	);
}

function AlbumTag({
	data,
	selectedAlbumId,
	onClick,
}: {
	data: AlbumData;
	selectedAlbumId: string | null;
	onClick: () => void;
}) {
	return (
		<div
			className={cn(
				"flex flex-none flex-grow-0 items-center gap-2 rounded-full px-4 py-2 text-zinc-100",
				{
					"bg-zinc-750": selectedAlbumId !== data.id,
				}
			)}
			style={
				selectedAlbumId === data.id
					? {
							backgroundColor: (data.color ?? DEFAULT_COLOR) + "90",
						}
					: undefined
			}
			onClick={onClick}
		>
			{data.name}
		</div>
	);
}

function MenuItem({
	data,
	onClick,
}: {
	data: TrackStatsType;
	onClick: () => void;
}) {
	return (
		<div
			key={data.id}
			className="rounded-md px-4 py-3 text-zinc-500 hover:bg-zinc-850 hover:text-zinc-100"
			onClick={onClick}
		>
			{data.name}
		</div>
	);
}
