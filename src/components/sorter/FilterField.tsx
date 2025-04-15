"use client";

import React, { useState } from "react";
import CheckBox from "../ui/CheckBox";
import { AlbumData, TrackData } from "@/types/data";
import { cn } from "@/lib/cn";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FilterType, setExcluded } from "@/features/sorter/sorterSlice";
import { useAppDispatch } from "@/store/hooks";

type FilterFieldProps = {
	albums: AlbumData[];
	singles?: TrackData[];
};

export default function FilterField({ albums, singles }: FilterFieldProps) {
	const [excludedIds, setExcludedIds] = useState<FilterType>({
		albums: [],
		tracks: [],
	});
	const dispatch = useAppDispatch();
	const router = useRouter();

	function handleItemClick(id: string, type: "albums" | "tracks") {
		setExcludedIds((prev) => {
			if (prev[type].includes(id)) {
				return { ...prev, [type]: prev[type].filter((item) => item !== id) };
			} else {
				return { ...prev, [type]: [...prev[type], id] };
			}
		});
	}

	function handleStart() {
		const filteredAlbums = albums.filter(
			(album) => !excludedIds.albums.includes(album.id)
		);
		if (filteredAlbums.length < 2) {
			alert("You need to at least select 2 albums.");
		} else {
			dispatch(setExcluded(excludedIds))
			router.replace(`/sorter/${albums[0].artistId}`);
		}
	}

	return (
		<>
			<div className="flex justify-center gap-4">
				<Button variant="lime" onClick={handleStart} rounded>
					Start Sorter
				</Button>
				<Link href={`/artist/${albums[0].artistId}/overview`}>
					<Button variant="gray" rounded>
						Quit Sorter
					</Button>
				</Link>
			</div>
			<div className="scrollbar-hidden overflow-auto">
				<div className="flex gap-3">
					{albums.map((album) => (
						<div
							key={album.id}
							onClick={() => handleItemClick(album.id, "albums")}
						>
							<FilterGalleryItem
								data={album}
								checked={!excludedIds.albums.includes(album.id)}
								subTitle={"Album"}
							/>
						</div>
					))}
					{singles?.map((single) => (
						<div
							key={single.id}
							onClick={() => handleItemClick(single.id, "tracks")}
						>
							<FilterGalleryItem
								data={single}
								checked={!excludedIds.tracks.includes(single.id)}
								subTitle={"Single"}
							/>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

function FilterGalleryItem({
	data,
	checked,
	subTitle,
}: {
	data: AlbumData | TrackData;
	checked: boolean;
	subTitle: string;
}) {
	return (
		<div className="relative min-w-40 max-w-40 space-y-2">
			<CheckBox className="absolute left-2 top-2 z-10" checked={checked} />
			<img
				className={cn("opacity-100 transition-all", {
					"opacity-25": !checked,
				})}
				src={data.img ?? "/pic/placeholder.jpg"}
				draggable={false}
			/>
			<div>
				<p className="line-clamp-2">{data.name}</p>
				<p className="text-sm text-zinc-400">{subTitle}</p>
			</div>
		</div>
	);
}
