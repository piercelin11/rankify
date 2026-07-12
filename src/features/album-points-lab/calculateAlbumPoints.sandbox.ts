import { AlbumPointsParams, AlbumScoreResult } from "./types";

// TEMPORARY(sandbox): Experimental album score formula, parameterized so the
// lab page can tune coefficients live. Also used by production pages to render
// an experimental score preview alongside the official AlbumStat-backed card —
// always called with DEFAULT_PARAMS there (no user-facing controls). Not yet
// backfilled into AlbumRanking/AlbumStat, so production usage must compute on
// read, not persist. Once a formula is finalized and backfilled, this whole
// file (and its production call sites) should be removed.

export const DEFAULT_PARAMS: AlbumPointsParams = {
	curveExponent: 2,
	penaltyTolerance: 1,
	penaltyScale: 3,
	penaltySteepness: 1.5,
	trimPercentile: 0.75,
};

const SCORE_MAX = 1000;

export type TrackRankingsType = { albumId: string | null; rank: number };

// Single-track score curve: 1000 x percentileRank^k. Unaffected by album-level shrinkage.
export function calculateRawTrackScore(
	rank: number,
	trackCount: number,
	curveExponent: number
): number {
	const percentileRank = (trackCount - rank + 1) / trackCount;
	return SCORE_MAX * Math.pow(percentileRank, curveExponent);
}

// How much weight the artist's global average should carry, based on how far this
// album's track count deviates from the artist's average album length. Deviation
// within penaltyTolerance carries zero weight (no penalty at all).
export function calculatePriorInfluence(
	albumTrackCount: number,
	avgAlbumTrackCount: number,
	params: AlbumPointsParams
): number {
	const deviation = Math.max(
		0,
		Math.abs(albumTrackCount - avgAlbumTrackCount) - params.penaltyTolerance
	);
	return deviation === 0
		? 0
		: Math.pow(deviation / params.penaltyScale, params.penaltySteepness);
}

// Bayesian shrinkage (bidirectional): pulls an album's observed average toward the
// artist's global average, whether the observed average is above or below it.
function shrinkToGlobalAvg(
	observedAvg: number,
	albumTrackCount: number,
	avgAlbumTrackCount: number,
	globalAvg: number,
	params: AlbumPointsParams
): number {
	const priorInfluence = calculatePriorInfluence(
		albumTrackCount,
		avgAlbumTrackCount,
		params
	);
	return (observedAvg + priorInfluence * globalAvg) / (1 + priorInfluence);
}

// One-directional penalty: only pulls an album's observed average DOWN toward the
// artist's global average when it's above that average — never pulls a below-average
// album up.
export function applyOneDirectionalPenalty(
	observedAvg: number,
	albumTrackCount: number,
	avgAlbumTrackCount: number,
	globalAvg: number,
	params: AlbumPointsParams
): number {
	if (observedAvg <= globalAvg) return observedAvg;

	const priorInfluence = calculatePriorInfluence(
		albumTrackCount,
		avgAlbumTrackCount,
		params
	);
	return (observedAvg + priorInfluence * globalAvg) / (1 + priorInfluence);
}

// Artist-level baselines shared by all four bars: the average per-track score across
// every album track, and the average number of tracks per album.
export function calculateArtistBaselines(
	rankingsGroupedByAlbum: Map<string, TrackRankingsType[]>,
	trackCount: number,
	curveExponent: number
): { globalAvg: number; avgAlbumTrackCount: number } {
	let globalScoreSum = 0;
	let globalTrackCount = 0;
	for (const groupedRankings of rankingsGroupedByAlbum.values()) {
		for (const trackRanking of groupedRankings) {
			globalScoreSum += calculateRawTrackScore(
				trackRanking.rank,
				trackCount,
				curveExponent
			);
			globalTrackCount += 1;
		}
	}
	const globalAvg = globalTrackCount > 0 ? globalScoreSum / globalTrackCount : 0;

	const albumTrackCounts = Array.from(rankingsGroupedByAlbum.values()).map(
		(group) => group.length
	);
	const avgAlbumTrackCount =
		albumTrackCounts.length > 0
			? albumTrackCounts.reduce((sum, n) => sum + n, 0) /
				albumTrackCounts.length
			: 0;

	return { globalAvg, avgAlbumTrackCount };
}

export function groupRankingsByAlbum(
	trackRankings: TrackRankingsType[]
): Map<string, TrackRankingsType[]> {
	const rankingsGroupedByAlbum = new Map<string, TrackRankingsType[]>();
	for (const ranking of trackRankings) {
		if (ranking.albumId) {
			if (!rankingsGroupedByAlbum.has(ranking.albumId)) {
				rankingsGroupedByAlbum.set(ranking.albumId, []);
			}
			rankingsGroupedByAlbum.get(ranking.albumId)!.push(ranking);
		}
	}
	return rankingsGroupedByAlbum;
}

// Bar 1: Weighted — bidirectional Bayesian shrinkage toward the artist's global average.
export function calculateAlbumPointsSandbox(
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
		let scoreSum = 0;
		let rankSum = 0;

		for (const trackRanking of groupedRankings) {
			scoreSum += calculateRawTrackScore(
				trackRanking.rank,
				trackCount,
				params.curveExponent
			);
			rankSum += trackRanking.rank;
		}

		const albumObservedAvg = scoreSum / groupedRankings.length;
		const adjustedAvg = shrinkToGlobalAvg(
			albumObservedAvg,
			groupedRankings.length,
			avgAlbumTrackCount,
			globalAvg,
			params
		);

		result.push({
			albumId,
			score: Math.floor(adjustedAvg),
			averageTrackRanking: rankSum / groupedRankings.length,
		});
	}

	return result.sort((a, b) => a.averageTrackRanking - b.averageTrackRanking);
}

// Bar 3: One-directional — same shrinkage math as Bar 1, but only ever pulls scores
// down (never up) toward the artist's global average.
export function calculateOneDirectionalAlbumPoints(
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
		let scoreSum = 0;
		let rankSum = 0;

		for (const trackRanking of groupedRankings) {
			scoreSum += calculateRawTrackScore(
				trackRanking.rank,
				trackCount,
				params.curveExponent
			);
			rankSum += trackRanking.rank;
		}

		const albumObservedAvg = scoreSum / groupedRankings.length;
		const adjustedAvg = applyOneDirectionalPenalty(
			albumObservedAvg,
			groupedRankings.length,
			avgAlbumTrackCount,
			globalAvg,
			params
		);

		result.push({
			albumId,
			score: Math.floor(adjustedAvg),
			averageTrackRanking: rankSum / groupedRankings.length,
		});
	}

	return result.sort((a, b) => a.averageTrackRanking - b.averageTrackRanking);
}
