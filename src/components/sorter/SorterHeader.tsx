"use client"; 

import React from "react";
import LogoDisplay from "../sidebar/LogoDisplay";
import { ArtistData } from "@/types/data";
import useSorterContext from "@/lib/hooks/contexts/SorterContext";
import { CheckIcon } from "@radix-ui/react-icons";
import LoadingAnimation from "../ui/LoadingAnimation";

type SorterHeaderProps = {
	artist: ArtistData;
};

export default function SorterHeader({ artist }: SorterHeaderProps) {
	const { percentage, isSaved, isSaving } = useSorterContext();

	return (
		<div className="grid grid-cols-3 items-center border-b border-zinc-750 p-6">
			<div className="flex gap-4 items-center">
				<LogoDisplay />
				<div className="flex h-5 justify-end text-zinc-500">
					{isSaved ? (
						<div className="flex items-center gap-1">
							<CheckIcon />
							<p>Saved</p>
						</div>
					) : isSaving ? (
						<div className="flex items-center gap-2">
							<LoadingAnimation size="small" isFull={false} />
							<p>Saving...</p>
						</div>
					) : (
						""
					)}
				</div>
			</div>

			<div className="justify-self-center">
				<p className="text-zinc-300">{artist.name}'s Sorter</p>
			</div>
			<div className="mt-2 justify-self-end pr-6">
				<div className="relative w-[300px]">
					<p
						className="absolute -top-5 text-right text-sm text-zinc-500"
						style={{ left: `${percentage}%` }}
					>
						{percentage}%
					</p>
					<div className="relative h-2 rounded-full bg-zinc-850">
						<div
							className="h-2 rounded-full bg-lime-500"
							style={{
								width: percentage + "%",
							}}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
}
