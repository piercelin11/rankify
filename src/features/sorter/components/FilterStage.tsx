"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlbumData, TrackData } from "@/types/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	FilterType,
	setExcluded,
	setPercentage,
} from "@/features/sorter/slices/sorterSlice";
import { useAppDispatch } from "@/store/hooks";
import { CurrentStage } from "./SorterPage";
import { PLACEHOLDER_PIC } from "@/constants";
import Image from "next/image";

type FilterStageProps = {
	albums: AlbumData[];
	tracks?: TrackData[];
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
	rankingType?: "artist" | "album";
	albumId?: string;
};

export default function FilterStage({
	albums,
	tracks,
	setCurrentStage,
	rankingType = "artist",
	albumId,
}: FilterStageProps) {
	const [excludedIds, setExcludedIds] = useState<FilterType>(() => {
		if (rankingType === "album") {
			// 專輯排名模式：預設全不選（所有專輯都在 excluded 中）
			return {
				albums: albums.map(album => album.id),
				tracks: [],
			};
		} else {
			// 歌手排名模式：預設全選（excluded 為空）
			return {
				albums: [],
				tracks: [],
			};
		}
	});
	const dispatch = useAppDispatch();
	const router = useRouter();

	const singles = tracks?.filter((track) => !track.albumId);

	function handleItemClick(id: string, type: "albums" | "tracks") {
		setExcludedIds((prev) => {
			const newExcludedIds = prev[type].includes(id)
				? { ...prev, [type]: prev[type].filter((item) => item !== id) }
				: { ...prev, [type]: [...prev[type], id] };

			return newExcludedIds;
		});

		// 專輯排名模式：當選擇專輯時，更新 URL 包含 albumId（在 setState 外部執行）
		if (rankingType === "album" && type === "albums") {
			const isCurrentlyExcluded = excludedIds.albums.includes(id);
			const willBeSelected = isCurrentlyExcluded; // 如果目前被排除，點擊後會被選中

			if (willBeSelected) {
				const currentUrl = new URL(window.location.href);
				currentUrl.searchParams.set("albumId", id);
				router.replace(currentUrl.toString());
			}
		}
	}

	function handleStart() {
		if (rankingType === "album") {
			const selectedAlbums = albums.filter(
				(album) => !excludedIds.albums.includes(album.id)
			);
			if (selectedAlbums.length !== 1) {
				alert("請選擇一張專輯進行排名。");
				return;
			}
		} else {
			const filteredAlbums = albums.filter(
				(album) => !excludedIds.albums.includes(album.id)
			);
			if (filteredAlbums.length < 2) {
				alert("You need to at least select 2 albums.");
				return;
			}
		}

		dispatch(setExcluded(excludedIds));
		setCurrentStage("sorting");
	}

	useEffect(() => {
		dispatch(setPercentage(0));
	}, [dispatch]);

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-center">Get Started</h3>
				<p className="text-description text-center">
					{rankingType === "album"
						? "選擇一張專輯進行歌曲排名。"
						: "filter out the albums and singles you haven't listen to."
					}
				</p>
			</div>
			<div className="flex justify-center gap-4">
				<Button onClick={handleStart}>
					Start Sorter
				</Button>
				<Link href={`/artist/${albums[0].artistId}/overview`}>
					<Button variant="secondary">
						Quit Sorter
					</Button>
				</Link>
			</div>
			<div className="overflow-auto scrollbar-hidden">
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
					{rankingType === "artist" && singles?.map((single) => (
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
		</div>
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
			<Checkbox className="absolute left-2 top-2 z-10" checked={checked} />
			<div className="relative aspect-square h-auto w-full rounded">
				<Image
					className={cn("opacity-100 transition-all", {
						"opacity-25": !checked,
					})}
					alt={data.name}
					src={data.img ?? PLACEHOLDER_PIC}
					draggable={false}
					sizes="160px"
					fill
				/>
			</div>
			<div>
				<p className="line-clamp-2">{data.name}</p>
				<p className="text-sm text-secondary-foreground">{subTitle}</p>
			</div>
		</div>
	);
}
