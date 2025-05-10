"use client";

import React from "react";
import LogoDisplay from "@/components/sidebar/LogoDisplay";
import { ArtistData } from "@/types/data.types";
import { CheckIcon } from "@radix-ui/react-icons";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import { useAppSelector } from "@/store/hooks";
import { PercentileBar } from "@/features/ranking/stats/components/PercentileBarsCard";

type SorterHeaderProps = {
	artist: ArtistData;
};

export default function SorterHeader({ artist }: SorterHeaderProps) {
	const percentage = useAppSelector((state) => state.sorter.percentage);
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);

	return (
		<div className="grid items-center border-b border-neutral-800 px-4 py-8 sm:grid-cols-3">
			<div className="flex items-center gap-2 justify-self-center sm:justify-self-auto">
				{/* <LogoDisplay /> */}
				<div className="hidden h-5 justify-end text-neutral-500 lg:flex">
					{saveStatus === "saved" ? (
						<div className="flex items-center gap-1">
							<CheckIcon />
							<p className="text-sm">Saved</p>
						</div>
					) : saveStatus === "pending" ? (
						<div className="flex items-center gap-2">
							<LoadingAnimation size="small" isFull={false} />
							<p className="text-sm">Saving...</p>
						</div>
					) : (
						""
					)}
				</div>
			</div>

			<div className="hidden justify-self-center sm:block">
				<p className="text-neutral-300">{artist.name}'s Sorter</p>
			</div>
			<div className="mt-2 w-full justify-self-end sm:w-fit">
				<div className="relative w-full sm:w-[150px] xl:w-[300px]">
					<p
						className="absolute -top-5 text-right text-sm text-neutral-500 -translate-x-full"
						style={{ left: `${percentage}%` }}
					>
						{percentage}%
					</p>
					<div className="relative h-2 rounded-full bg-neutral-900">
						<div
							className="h-2 rounded-full bg-primary-500"
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
