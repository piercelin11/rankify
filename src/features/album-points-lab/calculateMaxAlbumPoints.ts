import { AlbumPointsParams } from "./types";
import { DEFAULT_PARAMS } from "./calculateAlbumPoints.sandbox";

type TrackRankingsType = { albumId: string | null; rank: number };

const SCORE_MAX = 1000;

// Identical to the private helpers in calculateAlbumPoints.sandbox.ts — duplicated here
// (rather than exported/shared) to keep the sandbox file a faithful, self-contained copy
// of the production algorithm.
function calculateRawTrackScore(
	rank: number,
	trackCount: number,
	curveExponent: number
): number {
	const percentileRank = (trackCount - rank + 1) / trackCount;
	return SCORE_MAX * Math.pow(percentileRank, curveExponent);
}

function shrinkToGlobalAvg(
	observedAvg: number,
	albumTrackCount: number,
	avgAlbumTrackCount: number,
	globalAvg: number,
	params: AlbumPointsParams
): number {
	const deviation = Math.max(
		0,
		Math.abs(albumTrackCount - avgAlbumTrackCount) - params.penaltyTolerance
	);
	const priorInfluence =
		deviation === 0
			? 0
			: Math.pow(deviation / params.penaltyScale, params.penaltySteepness);

	return (observedAvg + priorInfluence * globalAvg) / (1 + priorInfluence);
}

// Theoretical ceiling for calculateAlbumPointsSandbox: the score an album would get
// if its tracks occupied ranks 1..k (k = albumTrackCount) — i.e. it swept the top of the chart.
// calculateRawTrackScore(rank)^curveExponent is strictly decreasing in rank for any
// curveExponent > 0, so ranks 1..k always gives the highest possible albumObservedAvg;
// no need to search other rank assignments. The shrinkage step depends only on
// albumTrackCount (not on rank), so it applies identically to the real score and this
// ceiling — it does not change which rank assignment is optimal.
export function calculateMaxAlbumPoints(
	trackRankings: TrackRankingsType[],
	params: AlbumPointsParams = DEFAULT_PARAMS
): Map<string, number> {
	const trackCount = trackRankings.length;

	const rankingsGroupedByAlbum = new Map<string, TrackRankingsType[]>();
	for (const ranking of trackRankings) {
		if (ranking.albumId) {
			if (!rankingsGroupedByAlbum.has(ranking.albumId)) {
				rankingsGroupedByAlbum.set(ranking.albumId, []);
			}
			rankingsGroupedByAlbum.get(ranking.albumId)!.push(ranking);
		}
	}

	// Artist-level baselines computed from the real ranking data — must match the
	// values calculateAlbumPointsSandbox derives from the same trackRankings/params.
	let globalScoreSum = 0;
	let globalTrackCount = 0;
	for (const groupedRankings of rankingsGroupedByAlbum.values()) {
		for (const trackRanking of groupedRankings) {
			globalScoreSum += calculateRawTrackScore(
				trackRanking.rank,
				trackCount,
				params.curveExponent
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

	const result = new Map<string, number>();
	for (const [albumId, groupedRankings] of rankingsGroupedByAlbum.entries()) {
		const albumTrackCount = groupedRankings.length;

		let maxScoreSum = 0;
		for (let rank = 1; rank <= albumTrackCount; rank++) {
			maxScoreSum += calculateRawTrackScore(
				rank,
				trackCount,
				params.curveExponent
			);
		}
		const albumMaxAvg = maxScoreSum / albumTrackCount;

		const adjustedMaxAvg = shrinkToGlobalAvg(
			albumMaxAvg,
			albumTrackCount,
			avgAlbumTrackCount,
			globalAvg,
			params
		);

		result.set(albumId, Math.floor(adjustedMaxAvg));
	}

	return result;
}
