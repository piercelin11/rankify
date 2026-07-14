import type { AlbumScoreStats } from "@/features/album-points-lab/getAlbumScoreHistory";
import type { LabAlbum } from "@/features/album-points-lab/types";
import type { AlbumStatsType } from "@/types/album";
import type { AlbumRankingItem } from "../types";

export function roundUp(value: number): number {
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

/**
 * 平均模式：分數與排名來自 AlbumStatsType（跨多次 submission 的累積平均），
 * peak 來自 sandbox 歷史（不截斷 submissionId，抓全部歷史的最高分）。
 * 平均分數沒有比較基準，percentChange 一律不提供。
 */
export function toAverageRankingItems(
	albumStats: AlbumStatsType[],
	peakHistory: AlbumScoreStats[]
): AlbumRankingItem[] {
	const peakByAlbumId = new Map(peakHistory.map((stat) => [stat.albumId, stat.peak]));

	return [...albumStats]
		.sort((a, b) => a.rank - b.rank)
		.map((album) => ({
			albumId: album.id,
			name: album.name,
			img: album.img,
			color: album.color,
			score: roundUp(album.avgPoints),
			peak: roundUp(peakByAlbumId.get(album.id) ?? album.avgPoints),
			rank: album.rank,
			rankChange: undefined,
			percentChange: undefined,
		}));
}
