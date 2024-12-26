import { OverallTrackRankingsType } from "@/lib/data/ranking/overall/getTrackRankings";
import React from "react";

type RankingListItemProps = {
	data: OverallTrackRankingsType;
	size?: number;
	length?: number;
};

export default function RankingListItem({
	data,
	size = 65,
	length = 1000,
}: RankingListItemProps) {
	const numberWidth = length < 10 ? 25 : length < 100 ? 35 : 45;

	return (
		<div
			className={`grid cursor-pointer select-none grid-cols-[${numberWidth}px,_${size}px,_1fr] items-center gap-3 rounded border-b border-zinc-900 px-2 py-3 hover:bg-zinc-900`}
		>
			<p className="mr-1 justify-self-end font-numeric text-lg font-medium tabular-nums text-zinc-400">
				{data.ranking}
			</p>
			<img
				className="rounded"
				src={data.img || undefined}
				alt={data.name}
				width={size}
				height={size}
			/>
			<div>
				<p className="font-medium">{data.name}</p>
				<p className="text-sm text-zinc-500">{data.album?.name}</p>
			</div>
		</div>
	);
}
