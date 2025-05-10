"use client";

import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import { cn } from "@/lib/cn";
import getArtistById from "@/lib/database/data/getArtistById";
import fetchSearchResults from "@/lib/spotify/fetchSearchResults";
import { AlbumData } from "@/types/data.types";
import { CheckIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type AlbumCoverSelectorProps = {
	album: AlbumData;
	onChange: () => void;
	onBlur: () => void;
	value: string;
};

export default function AlbumCoverSelector({
	album,
	onChange,
	onBlur,
	value,
}: AlbumCoverSelectorProps) {
	const [albumCoverOpiotns, setAlbumCoverOpiotns] = useState<
		(string | undefined)[]
	>([]);
	useEffect(() => {
		async function fetchCover() {
			const data =
				(await fetchSearchResults(`artist:${album.artist?.name} album:${album.name}`, "album", 4)) ?? [];
			setAlbumCoverOpiotns([
				...new Set([
					album.img!,
					...data.map((album) => album?.images?.[0]?.url),
				]),
			]);
		}
		fetchCover();
	}, []);

	return (
		<div className="space-y-4">
			<p className="text-sm text-neutral-500">Album cover</p>
			<div className="flex items-center gap-4 h-20">
				{albumCoverOpiotns.length !== 0 ? (
					albumCoverOpiotns?.map((url) => (
						<label
							key={url}
							className={cn(
								"relative flex items-center gap-2 overflow-hidden rounded text-neutral-500",
								{
									"outline outline-2 outline-primary-500": value === url,
								}
							)}
						>
							{value === url && (
								<div className="absolute left-1 top-1 rounded-full bg-primary-500 p-1">
									<CheckIcon
										className="text-neutral-950"
										width={15}
										height={15}
									/>
								</div>
							)}
							<Image
								className={cn({ "opacity-40": value !== url })}
								src={url || ""}
								width={80}
								height={80}
								alt={"album cover options"}
							/>
							<input
								type="radio"
								onChange={onChange}
								onBlur={onBlur}
								name="img"
								value={url}
								hidden
							/>
						</label>
					))
				) : (
					<LoadingAnimation />
				)}
			</div>
		</div>
	);
}
