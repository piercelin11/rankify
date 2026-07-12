import { AlbumPointsParams, AlbumScoreResult } from "./types";
import {
	applyOneDirectionalPenalty,
	calculateArtistBaselines,
	calculateRawTrackScore,
	DEFAULT_PARAMS,
	groupRankingsByAlbum,
	TrackRankingsType,
} from "./calculateAlbumPoints.sandbox";

// Bar 4: Trimmed — same one-directional penalty as Bar 3 (imported, not duplicated, so
// the only difference between the two bars is the trimming step below), but before
// averaging, each album keeps only its top trimPercentile best-ranked tracks and drops
// the rest. globalAvg/avgAlbumTrackCount are computed from the FULL, untrimmed data so
// all four bars share the same artist-level baseline.
export function calculateTrimmedAlbumPoints(
	trackRankings: TrackRankingsType[],
	params: AlbumPointsParams = DEFAULT_PARAMS
): AlbumScoreResult[] {
	const trackCount = trackRankings.length;
	const rankingsGroupedByAlbum = groupRankingsByAlbum(trackRankings);
	const { globalAvg, avgAlbumTrackCount } = calculateArtistBaselines(
		rankingsGroupedByAlbum,
		trackCount,
		params.curveExponent
	);

	const result: AlbumScoreResult[] = [];
	for (const [albumId, groupedRankings] of rankingsGroupedByAlbum.entries()) {
		const albumTrackCount = groupedRankings.length;

		const sortedByRank = [...groupedRankings].sort((a, b) => a.rank - b.rank);
		const keepCount = Math.max(
			1,
			Math.ceil(albumTrackCount * params.trimPercentile)
		);
		const trimmedRankings = sortedByRank.slice(0, keepCount);

		let scoreSum = 0;
		let rankSum = 0;
		for (const trackRanking of trimmedRankings) {
			scoreSum += calculateRawTrackScore(
				trackRanking.rank,
				trackCount,
				params.curveExponent
			);
			rankSum += trackRanking.rank;
		}

		const albumObservedAvg = scoreSum / trimmedRankings.length;
		// Deviation is judged on the album's real (untrimmed) track count — trimming
		// only affects which tracks count toward the score, not how "long" the album is.
		const adjustedAvg = applyOneDirectionalPenalty(
			albumObservedAvg,
			albumTrackCount,
			avgAlbumTrackCount,
			globalAvg,
			params
		);

		result.push({
			albumId,
			score: Math.floor(adjustedAvg),
			averageTrackRanking: rankSum / trimmedRankings.length,
		});
	}

	return result.sort((a, b) => a.averageTrackRanking - b.averageTrackRanking);
}
