"use client";

import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import FormMessage from "@/components/form/FormMessage";
import { cn } from "@/lib/cn";
import fetchSearchResults from "@/lib/spotify/fetchSearchResults";
import { AlbumData } from "@/types/data";
import { CheckCircledIcon } from "@radix-ui/react-icons";
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
				(await fetchSearchResults(`album:${album.name}`, "album", 5)) ?? [];
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
			<div className="flex items-center gap-4">
				{albumCoverOpiotns.length !== 1 ? (
					albumCoverOpiotns?.map((url) => (
						<label
							key={url}
							className={cn(
								"relative flex items-center gap-2 overflow-hidden rounded text-neutral-500",
								{
									"outline outline-1 outline-primary-500": value === url,
								}
							)}
						>
							{value === url && (
								<CheckCircledIcon
									className="absolute left-2 top-2 text-primary-500"
									width={20}
									height={20}
								/>
							)}
							<Image
								src={url || ""}
								width={70}
								height={70}
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
