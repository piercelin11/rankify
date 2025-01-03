"use client";

import React from "react";
import LogoDisplay from "../sidebar/LogoDisplay";
import { ArtistData } from "@/types/data";
import useSorterContext from "@/lib/hooks/contexts/SorterContext";

type SorterHeaderProps = {
	artist: ArtistData;
};

export default function SorterHeader({ artist }: SorterHeaderProps) {
	const { percentage } = useSorterContext();

	return (
		<div className="grid grid-cols-3 items-center border-b border-zinc-750 p-6">
			<LogoDisplay />
			<div className="justify-self-center">
				<p className="text-zinc-300">{artist.name}'s Sorter</p>
			</div>
			<div className="justify-self-end mt-2">
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
