"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Plus, PlusIcon } from "lucide-react";
import type { Album } from "@prisma/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { PLACEHOLDER_PIC } from "@/constants";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type AlbumWithSessions = Album & {
	sessionCount: number;
};

type Props = {
	albums: AlbumWithSessions[];
	artistId: string;
};

export default function AlbumsSorterChecklist({ albums, artistId }: Props) {
	const [showAll, setShowAll] = useState(false);
	const isMobile = useIsMobile();

	const albumsSortBySessionCount = [...albums].sort(
		(a, b) => b.sessionCount - a.sessionCount
	);

	const albumsCount = albumsSortBySessionCount.length;
	const sortedAlbumsCount = albumsSortBySessionCount.filter(
		(album) => album.sessionCount > 0
	).length;

	const initialLimit = isMobile ? 4 : 6;
	const displayedAlbums = showAll
		? albumsSortBySessionCount
		: albumsSortBySessionCount.slice(0, initialLimit);
	const hasMore = albumsCount > initialLimit;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-6">
				<div>
					<h2>Album Rank Progress</h2>
					<div className="flex items-center gap-2">
						<Progress
							className="h-1.5 w-64"
							value={(sortedAlbumsCount / albumsCount) * 100}
						/>
						<p className="text-sm text-muted-foreground">
							{sortedAlbumsCount}/{albumsCount} sorted •{" "}
							{((sortedAlbumsCount / albumsCount) * 100).toFixed(0)}%
						</p>
					</div>
				</div>
				{/* TODO: 補上彈跳視窗以及未排名專輯選項 */}
				<Button variant={"secondary"}>
					<PlusIcon />
					Finish the Rest
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
				{displayedAlbums.map((album) => (
					<div key={album.id}>
						<div className="group relative aspect-square w-full overflow-hidden rounded-lg">
							<Link href={`/artist/${artistId}/album/${album.id}`}>
								<Image
									src={album.img || PLACEHOLDER_PIC}
									alt={album.name}
									fill
									sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 17vw"
									className={cn(
										`object-cover transition-all duration-300 group-hover:scale-105`,
										{
											"opacity-20": album.sessionCount === 0,
										}
									)}
								/>
							</Link>
							<div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
								<Link href={`/sorter/album/${album.id}`}>
									<Button
										variant="primary"
										size="icon"
										className="h-8 w-8 rounded-full shadow-lg"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
						<div className="mt-2">
							<Link href={`/artist/${artistId}/album/${album.id}`}>
								<h3 className="cursor-pointer truncate text-base font-semibold hover:underline">
									{album.name}
								</h3>
							</Link>
							<p className="text-sm text-muted-foreground">
								{album.sessionCount}{" "}
								{album.sessionCount <= 1 ? "submission" : "submissions"}
							</p>
						</div>
					</div>
				))}
			</div>

			{hasMore && (
				<div className="mt-6 flex justify-center">
					<Button
						variant="ghost"
						onClick={() => setShowAll(!showAll)}
						className="px-0 text-secondary-foreground"
					>
						{showAll ? "Show less" : `Show all ${albums.length} albums`}
					</Button>
				</div>
			)}
		</div>
	);
}
