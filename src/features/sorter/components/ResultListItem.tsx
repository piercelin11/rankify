import React, { HTMLAttributes } from "react";
import { RankingResultData } from "./SortingStage";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PLACEHOLDER_PIC } from "@/constants";

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
			className={cn("grid cursor-pointer select-none grid-cols-[25px,_70px,_1fr] items-center gap-3 rounded border-b  px-6 py-3 hover:bg-neutral-900", className)}
			{...props}
		>
			<p className="mr-2 justify-self-end font-serif text-lg font-medium text-muted-foreground">
				{ranking}
			</p>
			<Image
				className="rounded"
				src={data.img || PLACEHOLDER_PIC}
				alt={data.name}
				width={70}
				height={70}
			/>
			<div>
				<p>{data.name}</p>
				<p className="text-muted-foreground">{data.album?.name}</p>
			</div>
		</div>
	);
}
