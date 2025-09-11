import React, { HTMLAttributes } from "react";
import { RankingResultData } from "./SortingStage";
import { cn } from "@/lib/utils";

type ResultListItemProps = {
	data: RankingResultData;
	ranking: number;
} & HTMLAttributes<HTMLDivElement>;

export default function ResultListItem({
	data,
	ranking,
	className,
	...props
}: ResultListItemProps) {
	return (
		<div
			className={cn("grid cursor-pointer select-none grid-cols-[25px,_70px,_1fr] items-center gap-3 rounded border-b border-neutral-800 px-6 py-3 hover:bg-neutral-900", className)}
			{...props}
		>
			<p className="mr-2 justify-self-end font-serif text-lg font-medium text-neutral-500">
				{ranking}
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
				<p className="text-neutral-500">{data.album?.name}</p>
			</div>
		</div>
	);
}
