import type { AlbumScoreStats } from "@/features/album-points-lab/getAlbumScoreHistory";
import type { LabAlbum } from "@/features/album-points-lab/types";
import type { AlbumRankingItem } from "../types";

function roundUp(value: number): number {
	return Math.ceil(value);
}

export function toLatestRankingItems(
	history: AlbumScoreStats[],
	albums: LabAlbum[]
): AlbumRankingItem[] {
	const albumById = new Map(albums.map((album) => [album.id, album]));

	return [...history]
		.sort((a, b) => a.rank - b.rank)
		.map((stat) => {
			const album = albumById.get(stat.albumId);
			return {
				albumId: stat.albumId,
				name: album?.name ?? "Unknown album",
				img: album?.img ?? null,
				color: album?.color ?? null,
				score: roundUp(stat.score),
				peak: roundUp(stat.peak),
				rank: stat.rank,
				rankChange: stat.rankChange,
				percentChange: stat.changeFromPrevious,
			};
		});
}
