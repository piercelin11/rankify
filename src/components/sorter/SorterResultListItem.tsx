import { TrackData } from "@/types/data";
import React from "react";
import { RankingResultData } from "./SorterField";

type SorterResultListItemProps = {
	data: RankingResultData;
};

export default function SorterResultListItem({
	data,
}: SorterResultListItemProps) {
	return (
		<div className="grid cursor-pointer select-none grid-cols-[25px,_70px,_1fr] items-center gap-3 rounded px-6 py-2 hover:bg-zinc-900">
			<p className="mr-2 justify-self-end font-serif text-lg font-medium text-zinc-500">
				{data.ranking}
			</p>
			<img
				className="rounded"
				src={data.img || undefined}
				alt={data.name}
				width={70}
				height={70}
			/>
            <div>
                <p>{data.name}</p>
                <p className="text-zinc-500">{data.album?.name}</p>
            </div>
		</div>
	);
}
