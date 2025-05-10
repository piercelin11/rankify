"use client";

import { useAppSelector } from "@/store/hooks";
import { ArtistData } from "@/types/data.types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Tooltip from "../overlay/Tooltip";
import { cn } from "@/lib/cn";
import { PLACEHOLDER_PIC } from "@/constants";

type SidebarArtistItemProps = {
	artistData: ArtistData;
};

export default function SidebarArtistItem({
	artistData,
}: SidebarArtistItemProps) {
	const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
	return (
		<Link href={`/artist/${artistData.id}/overview`}>
			<div className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100">
				<Tooltip
					className={cn({
						hidden: isSidebarOpen,
					})}
					content={artistData.name}
					position="right"
				>
					<div className="relative min-h-10 min-w-10">
						<Image
							className="rounded-full"
							fill
							src={artistData.img || PLACEHOLDER_PIC}
							alt={artistData.name}
							sizes="40px"
						/>
					</div>
				</Tooltip>

				<p className="overflow-hidden text-ellipsis text-nowrap">
					{artistData.name}
				</p>
			</div>
		</Link>
	);
}
