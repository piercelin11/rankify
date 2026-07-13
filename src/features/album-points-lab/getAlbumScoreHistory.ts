// TEMPORARY(sandbox): computes peak/change/submissionCount on read by
// re-scoring every historical ARTIST-type submission with the current
// formula/params. Not backfilled: once a formula is finalized and
// AlbumRanking.points is backfilled, this whole file should be removed in
// favor of a MAX()/adjacent-row aggregate query against AlbumRanking.
import { db } from "@/db/client";
import {
	calculateOneDirectionalAlbumPoints,
	DEFAULT_PARAMS,
} from "./calculateAlbumPoints.sandbox";
import { calculateUnweightedAlbumScore } from "./calculateUnweightedScore";
import { AlbumScoreResult } from "./types";

type GetAlbumScoreHistoryProps = {
	artistId: string;
	userId: string;
	// When provided, scopes history to submissions up to and including this one
	// (by createdAt), so a single-submission page can get both "this
	// submission's score" (last entry in each album's score list) and
	// "change from previous" (slice(-2) of that same list) from one call.
	submissionId?: string;
};

type RankingsBySubmission = Map<
	string,
	{ createdAt: Date; rankings: { albumId: string | null; rank: number }[] }
>;

type SubmissionScorePoint = {
	submissionId: string;
	createdAt: Date;
	scores: AlbumScoreResult[];
};

export type AlbumScoreStats = {
	albumId: string;
	score: number;
	rank: number;
	previousRank: number | null;
	rankChange: number | null;
	changeFromPrevious: number | null;
	peak: number;
	submissionCount: number;
};

function rankByScore(scores: AlbumScoreResult[]): Map<string, number> {
	const sorted = [...scores].sort((a, b) => b.score - a.score);
	return new Map(sorted.map(({ albumId }, index) => [albumId, index + 1]));
}

async function getRankingsBySubmission({
	artistId,
	userId,
	submissionId,
}: GetAlbumScoreHistoryProps): Promise<RankingsBySubmission> {
	const cutoff = submissionId
		? await db.rankingSubmission.findUnique({
				where: { id: submissionId },
				select: { createdAt: true },
			})
		: null;

	const trackRankings = await db.trackRanking.findMany({
		where: {
			artistId,
			userId,
			submission: {
				type: "ARTIST",
				status: "COMPLETED",
				...(cutoff ? { createdAt: { lte: cutoff.createdAt } } : {}),
			},
		},
		select: {
			rank: true,
			submissionId: true,
			track: { select: { albumId: true } },
			submission: { select: { createdAt: true } },
		},
		orderBy: { submission: { createdAt: "asc" } },
	});

	const bySubmission: RankingsBySubmission = new Map();
	for (const tr of trackRankings) {
		const entry = bySubmission.get(tr.submissionId);
		const ranking = { albumId: tr.track.albumId, rank: tr.rank };
		if (entry) {
			entry.rankings.push(ranking);
		} else {
			bySubmission.set(tr.submissionId, {
				createdAt: tr.submission.createdAt,
				rankings: [ranking],
			});
		}
	}
	return bySubmission;
}

function toStatsPerAlbum(points: SubmissionScorePoint[]): AlbumScoreStats[] {
	const byAlbum = new Map<
		string,
		{ submissionId: string; score: number; rank: number }[]
	>();
	for (const point of points) {
		const ranks = rankByScore(point.scores);
		for (const { albumId, score } of point.scores) {
			const entry = byAlbum.get(albumId) ?? [];
			entry.push({
				submissionId: point.submissionId,
				score,
				rank: ranks.get(albumId) ?? Number.MAX_SAFE_INTEGER,
			});
			byAlbum.set(albumId, entry);
		}
	}

	return Array.from(byAlbum.entries())
		.filter(([, scores]) => scores.length > 0)
		.map(([albumId, scores]) => {
			const peak = Math.max(...scores.map((s) => s.score));
			const submissionCount = scores.length;
			const latest = scores[scores.length - 1];
			const previous =
				scores.length > 1 ? scores[scores.length - 2] : undefined;
			const changeFromPrevious =
				previous && previous.score !== 0
					? (latest.score - previous.score) / previous.score
					: null;
			const rankChange = previous ? previous.rank - latest.rank : null;

			return {
				albumId,
				score: latest.score,
				rank: latest.rank,
				previousRank: previous?.rank ?? null,
				rankChange,
				changeFromPrevious,
				peak,
				submissionCount,
			};
		});
}

async function getScoreHistory(
	props: GetAlbumScoreHistoryProps,
	scoreFn: (
		rankings: { albumId: string | null; rank: number }[]
	) => AlbumScoreResult[]
): Promise<AlbumScoreStats[]> {
	const bySubmission = await getRankingsBySubmission(props);
	const points: SubmissionScorePoint[] = Array.from(
		bySubmission.entries()
	).map(([submissionId, { createdAt, rankings }]) => ({
		submissionId,
		createdAt,
		scores: scoreFn(rankings),
	}));
	return toStatsPerAlbum(points);
}

export function getAlbumScoreHistory(
	props: GetAlbumScoreHistoryProps
): Promise<AlbumScoreStats[]> {
	return getScoreHistory(props, (rankings) =>
		calculateOneDirectionalAlbumPoints(rankings, DEFAULT_PARAMS)
	);
}

export function getUnweightedAlbumScoreHistory(
	props: GetAlbumScoreHistoryProps
): Promise<AlbumScoreStats[]> {
	return getScoreHistory(props, calculateUnweightedAlbumScore);
}
