"use client";
import { AlbumData, TrackData } from "@/types/data";
import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import TrackActionSection from "./TrackActionSection";

type TrackListItemProps = {
	trackData: TrackData;
	albums: AlbumData[];
	number?: number;
} & HTMLAttributes<HTMLDivElement>;

export const AdminTrackListStyle =
	"grid grid-cols-[1fr,_60px] sm:grid-cols-[2fr,_2fr,_1fr,_60px] gap-10";

export default function TrackListItem({
	trackData,
	albums,
	number,
	className,
	...props
}: TrackListItemProps) {

	return (
		<div
			className={cn(
				"grid cursor-pointer select-none grid-cols-[25px,_65px,_1fr] items-center gap-3 rounded bg-neutral-950 sm:px-6 py-2 hover:bg-neutral-900",
				className
			)}
			{...props}
		>
			<p className="mr-2 justify-self-end font-serif text-lg font-medium text-neutral-500">
				{number || trackData.trackNumber}
			</p>
			<img
				className="rounded w-15 sm:w-16"
				src={trackData.img || undefined}
				alt={trackData.name}
			/>
			<div className={`${AdminTrackListStyle}`}>
				<p>{trackData.name}</p>
				<p className="text-neutral-500 hidden sm:block">
					{trackData.album?.name || "Non-album track"}
				</p>
				<p className="text-neutral-500 hidden sm:block">{trackData.type}</p>
				<TrackActionSection
					data={trackData}
					albums={albums}
				/>
			</div>
		</div>
	);
}
