import { cn } from "@/lib/cn";
import { TrackHistoryType } from "@/lib/data/ranking/history/getTrackRankingHistory";
import { OverallTrackRankingsType } from "@/lib/data/ranking/overall/getTrackStats";
import React from "react";

type RankingListItemProps = {
	data: OverallTrackRankingsType | TrackHistoryType;
	size?: number;
	length?: number;
};

export default function RankingListItem({
	data,
	length = 1000,
}: RankingListItemProps) {
	const numberWidth = length < 10 ? 25 : length < 100 ? 35 : 45;

	return (
		<div
			className={cn("grid cursor-pointer select-none items-center gap-3 rounded border-b border-zinc-900 px-2 py-3 hover:bg-zinc-900", {
				"grid-cols-[45px,_65px,_1fr]": numberWidth === 45,
				"grid-cols-[35px,_65px,_1fr]": numberWidth === 35,
				"grid-cols-[25px,_65px,_1fr]": numberWidth === 25
			})}
		>
			<p className="mr-1 justify-self-end font-numeric text-lg font-medium tabular-nums text-zinc-400">
				{data.ranking}
			</p>
			<img
				className="rounded"
				src={data.img || undefined}
				alt={data.name}
				width={65}
				height={65}
			/>
			<div>
				<p className="font-medium">{data.name}</p>
				<p className="text-sm text-zinc-500">{data.album?.name}</p>
			</div>
		</div>
	);
}
