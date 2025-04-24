import { ArtistData } from "@/types/data";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type SidebarArtistItemProps = {
	artistData: ArtistData;
};

export default function SidebarArtistItem({
	artistData,
}: SidebarArtistItemProps) {
	return (
		<Link href={`/artist/${artistData.id}/overview`}>
			<button className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100">
				<div className="relative min-h-10 min-w-10">
					<Image
						className="rounded-full"
						fill
						src={artistData.img || "/pic/placeholder.jpg"}
						alt={artistData.name}
						sizes="40px"
					/>
				</div>
				<p className="overflow-hidden text-ellipsis text-nowrap">
					{artistData.name}
				</p>
			</button>
		</Link>
	);
}
