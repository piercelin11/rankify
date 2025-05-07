"use client";

import { SCROLL_SESSION_KEY } from "@/features/ranking/display/hooks/useListScroll";
import { ArtistData, TrackData } from "@/types/data";
import Image from "next/image";
import Link from "next/link";

export default function TrackPageSubtitleContent({
	trackData,
}: {
	trackData: TrackData & { artist: ArtistData };
}) {
	function handleLinkClick() {
		sessionStorage.removeItem(SCROLL_SESSION_KEY);
	}
	return (
		<>
			<div className="flex items-center gap-1">
				<Image
					className="rounded-full"
					width={30}
					height={30}
					src={trackData.artist.img ?? ""}
					alt={trackData.artist.name}
				/>
				<Link
					className="font-bold hover:underline"
					href={`/artist/${trackData.artist.id}`}
					onClick={handleLinkClick}
				>
					{trackData.artist.name}
				</Link>
			</div>
			{trackData.album && (
				<>
					•
					<Link
						className="hover:underline"
						href={`/artist/${trackData.artist.id}/album/${trackData.albumId}`}
						onClick={handleLinkClick}
					>
						{trackData.album.name}
					</Link>
				</>
			)}
		</>
	);
}
