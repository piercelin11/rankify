import { AlbumScoreResult } from "./types";

type TrackRankingsType = { albumId: string | null; rank: number };

// Baseline score with no percentile tiers, no smoothing, no length penalty —
// purely "how good is this album's average rank" for comparison against the weighted algorithm.
export function calculateUnweightedAlbumScore(
	trackRankings: TrackRankingsType[]
): AlbumScoreResult[] {
	const totalTrackCount = trackRankings.length;
	const rankingsGroupedByAlbum = new Map<string, TrackRankingsType[]>();
	for (const ranking of trackRankings) {
		if (ranking.albumId) {
			if (!rankingsGroupedByAlbum.has(ranking.albumId)) {
				rankingsGroupedByAlbum.set(ranking.albumId, []);
			}
			rankingsGroupedByAlbum.get(ranking.albumId)!.push(ranking);
		}
	}

	const result: AlbumScoreResult[] = [];
	for (const [albumId, groupedRankings] of rankingsGroupedByAlbum.entries()) {
		const rankSum = groupedRankings.reduce((sum, t) => sum + t.rank, 0);
		const averageTrackRanking = rankSum / groupedRankings.length;
		const score = Math.floor(
			((totalTrackCount - averageTrackRanking + 1) / totalTrackCount) * 800
		);
		result.push({ albumId, score, averageTrackRanking });
	}

	return result.sort((a, b) => a.averageTrackRanking - b.averageTrackRanking);
}
