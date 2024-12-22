import { TrackData } from "@/types/data";
import React from "react";

type ListItemProps = {
    trackData: TrackData
	number?: number;
}

export default function ListItem({trackData, number}: ListItemProps) {
	return (
		<div
			key={trackData.id}
			className="grid cursor-pointer select-none grid-cols-[30px,_65px,_1fr] items-center gap-3 rounded px-3 py-2 hover:bg-zinc-900"
		>
			<p className="mr-2 justify-self-end font-serif text-lg font-medium text-zinc-500">
				{number || trackData.trackNumber}
			</p>
			<img
				className="rounded"
				src={trackData.img || undefined}
				alt={trackData.name}
				width={65}
				height={65}
			/>
			<div>
				<p>{trackData.name}</p>
				<p className="text-sm text-zinc-400">{trackData.artist?.name}</p>
			</div>
		</div>
	);
}
