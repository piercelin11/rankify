"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, ChevronDown } from "lucide-react";
import type { Album } from "@prisma/client";

type AlbumWithSessions = Album & {
	sessionCount: number;
	rankings: {
		rankingSession: {
			id: string;
		};
	}[];
};

type AlbumWithRank = AlbumWithSessions & {
	rank: string | number;
};

type AlbumRankingBoardProps = {
	albums: AlbumWithSessions[];
	artistId: string;
};

export default function AlbumRankingBoard({ albums, artistId }: AlbumRankingBoardProps) {
	const router = useRouter();
	const [isExpanded, setIsExpanded] = useState(false);

	const sortedAlbums = [...albums].sort((a, b) => b.sessionCount - a.sessionCount);

	// 計算排名（相同次數相同名次，零次數顯示 "-"）
	const albumsWithRank: AlbumWithRank[] = sortedAlbums.map((album, index): AlbumWithRank => {
		if (album.sessionCount === 0) {
			return { ...album, rank: "-" };
		}

		// 找到相同次數的前一個專輯的名次
		const sameCountPrevIndex = sortedAlbums.findIndex((prev, prevIndex) =>
			prevIndex < index && prev.sessionCount === album.sessionCount
		);

		if (sameCountPrevIndex !== -1) {
			// 如果有相同次數的專輯，使用相同名次
			const prevAlbum: AlbumWithRank = albumsWithRank[sameCountPrevIndex];
			return { ...album, rank: prevAlbum.rank };
		} else {
			// 新的名次
			return { ...album, rank: index + 1 };
		}
	});

	const displayedAlbums = isExpanded ? albumsWithRank : albumsWithRank.slice(0, 5);
	const hasMore = albumsWithRank.length > 5;

	const handleRankAgain = (albumId: string) => {
		router.push(`/sorter?artistId=${artistId}&type=album&albumId=${albumId}`);
	};

	return (
		<div className="relative">
			<div className="space-y-3">
				{displayedAlbums.map((album: AlbumWithRank) => (
					<Link
						key={album.id}
						href={`/artist/${artistId}/album/${album.id}`}
					>
						<div className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg">
							{/* 排名 */}
							<div className="text-2xl font-bold text-muted-foreground min-w-[2.5rem] text-center">
								{album.rank}
							</div>

							{/* 專輯封面 */}
							<div className="flex-shrink-0">
								{album.img ? (
									<Image
										src={album.img}
										alt={album.name}
										width={48}
										height={48}
										className="rounded-md"
									/>
								) : (
									<div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
										<span className="text-xs text-muted-foreground">No Image</span>
									</div>
								)}
							</div>

							{/* 專輯名稱 */}
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-base truncate">{album.name}</h3>
							</div>

							{/* 排名次數統計 */}
							<div className="flex-shrink-0">
								<div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
									排名 {album.sessionCount} 次
								</div>
							</div>

							{/* + 按鈕 */}
							<div className="flex-shrink-0">
								<Button
									variant="outline"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={(e) => {
										e.stopPropagation();
										handleRankAgain(album.id);
									}}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</Link>
				))}
			</div>

			{/* View All 按鈕 */}
			{hasMore && (
				<div className="flex justify-center mt-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2"
					>
						{isExpanded ? "收起" : "查看全部"}
						<ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
					</Button>
				</div>
			)}
		</div>
	);
}