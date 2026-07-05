import { searchSongs } from "@/lib/itunes/search";
import { lookupCollectionTracks } from "@/lib/itunes/lookup";
import { fetchTrackPreviewDirect } from "@/lib/itunes/fetchPreviewUrl";
import {
	titlesMatch,
	titlesMatchLoose,
	TRACK_MATCH_THRESHOLD,
	ALBUM_MATCH_THRESHOLD,
	LOOSE_MATCH_THRESHOLD,
} from "@/lib/itunes/normalize";
import { ItunesSongResult } from "@/lib/itunes/types";

/**
 * Loose retry against a set of already-fetched direct-search results (e.g.
 * from fetchTrackPreviewDirect's rawResults), for a track that failed strict
 * matching. Shared by Phase 4 (within resolveAlbumPreviewUrls) and standalone
 * track handling in the backfill script, so both paths get the same
 * "(feat. X)"-tolerant recovery instead of duplicating the loop.
 */
export function findBestDirectMatchLoose(
	trackName: string,
	rawResults: ItunesSongResult[]
): { previewUrl: string | null; score: number } | null {
	let best: { previewUrl: string | null; score: number } | null = null;

	for (const result of rawResults) {
		const score = titlesMatchLoose(result.trackName, trackName);
		if (score < LOOSE_MATCH_THRESHOLD) continue;
		if (!best || score > best.score) {
			best = { previewUrl: result.previewUrl, score };
		}
	}

	return best;
}

export type AlbumPreviewTrack = {
	id: string;
	name: string;
	previewUrl: string | null;
};

export type AlbumPreviewInput = {
	albumId: string;
	albumName: string;
	artistName: string;
	tracks: AlbumPreviewTrack[];
};

export type MatchOutcome =
	| { kind: "matched"; previewUrl: string | null; source: string; score: number }
	| { kind: "unmatched"; bestScore?: number };

export type AlbumPreviewResult = {
	updates: Map<string, string | null>;
	outcomes: Map<string, MatchOutcome>;
	candidateCollections: { collectionId: number; collectionName: string }[];
};

async function findCandidateCollectionForward(
	tracks: AlbumPreviewTrack[],
	artistName: string,
	albumName: string
): Promise<{ collectionId: number; collectionName: string } | null> {
	for (const track of tracks) {
		const results = await searchSongs(`${track.name} ${artistName}`);
		const match = results.find(
			(r) => titlesMatch(r.collectionName, albumName) >= ALBUM_MATCH_THRESHOLD
		);
		if (match) {
			return { collectionId: match.collectionId, collectionName: match.collectionName };
		}
	}
	return null;
}

async function findCandidateCollectionByMajorityVote(
	tracks: AlbumPreviewTrack[],
	artistName: string
): Promise<{ collectionId: number; collectionName: string } | null> {
	const counts = new Map<number, { count: number; collectionName: string }>();

	for (const track of tracks) {
		const results = await searchSongs(`${track.name} ${artistName}`);
		for (const result of results) {
			const existing = counts.get(result.collectionId);
			if (existing) {
				existing.count++;
			} else {
				counts.set(result.collectionId, { count: 1, collectionName: result.collectionName });
			}
		}
	}

	let winner: { collectionId: number; collectionName: string; count: number } | null = null;
	for (const [collectionId, { count, collectionName }] of counts) {
		if (!winner || count > winner.count) {
			winner = { collectionId, collectionName, count };
		}
	}

	return winner ? { collectionId: winner.collectionId, collectionName: winner.collectionName } : null;
}

async function discoverCandidateCollections(
	tracks: AlbumPreviewTrack[],
	artistName: string,
	albumName: string
): Promise<{ collectionId: number; collectionName: string }[]> {
	const forward = await findCandidateCollectionForward(tracks, artistName, albumName);
	const backward = await findCandidateCollectionForward(
		[...tracks].reverse(),
		artistName,
		albumName
	);

	const candidates = [forward, backward].filter(
		(c): c is { collectionId: number; collectionName: string } => c !== null
	);

	if (candidates.length === 0) {
		const majorityVote = await findCandidateCollectionByMajorityVote(tracks, artistName);
		if (majorityVote) candidates.push(majorityVote);
	}

	const seen = new Set<number>();
	return candidates.filter((c) => {
		if (seen.has(c.collectionId)) return false;
		seen.add(c.collectionId);
		return true;
	});
}

type PoolEntry = ItunesSongResult & { sourceCollectionName: string };

function findBestPoolMatch(
	trackName: string,
	albumName: string,
	pool: PoolEntry[]
): { entry: PoolEntry; score: number } | null {
	let best: { entry: PoolEntry; score: number; albumScore: number } | null = null;

	for (const entry of pool) {
		const score = titlesMatch(entry.trackName, trackName);
		if (score < TRACK_MATCH_THRESHOLD) continue;

		const albumScore = titlesMatch(entry.sourceCollectionName, albumName);

		if (
			!best ||
			score > best.score ||
			(score === best.score && albumScore > best.albumScore)
		) {
			best = { entry, score, albumScore };
		}
	}

	return best ? { entry: best.entry, score: best.score } : null;
}

/**
 * Phase 2.5 — loose retry against the same candidate pool for tracks that
 * failed strict matching (e.g. the local title lacks a "(feat. X)" tag that
 * the only matching iTunes recording has). No album-name tie-break: at this
 * relaxed threshold, the first candidate clearing the bar is good enough.
 */
function findBestPoolMatchLoose(
	trackName: string,
	pool: PoolEntry[]
): { entry: PoolEntry; score: number } | null {
	let best: { entry: PoolEntry; score: number } | null = null;

	for (const entry of pool) {
		const score = titlesMatchLoose(entry.trackName, trackName);
		if (score < LOOSE_MATCH_THRESHOLD) continue;

		if (!best || score > best.score) {
			best = { entry, score };
		}
	}

	return best;
}

export async function resolveAlbumPreviewUrls(
	input: AlbumPreviewInput
): Promise<AlbumPreviewResult> {
	const { albumName, artistName, tracks } = input;

	const updates = new Map<string, string | null>();
	const outcomes = new Map<string, MatchOutcome>();

	const candidateCollections = await discoverCandidateCollections(
		tracks,
		artistName,
		albumName
	);

	const remaining = new Set(tracks.map((t) => t.id));
	const pool: PoolEntry[] = [];

	if (candidateCollections.length > 0) {
		for (const candidate of candidateCollections) {
			const collectionTracks = await lookupCollectionTracks(candidate.collectionId);
			for (const t of collectionTracks) {
				pool.push({ ...t, sourceCollectionName: candidate.collectionName });
			}
		}

		// Phase 2 — strict pool match.
		for (const track of tracks) {
			const best = findBestPoolMatch(track.name, albumName, pool);
			if (best) {
				updates.set(track.id, best.entry.previewUrl);
				outcomes.set(track.id, {
					kind: "matched",
					previewUrl: best.entry.previewUrl,
					source: best.entry.sourceCollectionName,
					score: best.score,
				});
				remaining.delete(track.id);
			}
		}

		// Phase 2.5 — loose retry against the same pool for tracks Phase 2
		// couldn't match (e.g. missing "(feat. X)" tag).
		for (const track of tracks) {
			if (!remaining.has(track.id)) continue;

			const best = findBestPoolMatchLoose(track.name, pool);
			if (best) {
				updates.set(track.id, best.entry.previewUrl);
				outcomes.set(track.id, {
					kind: "matched",
					previewUrl: best.entry.previewUrl,
					source: `${best.entry.sourceCollectionName} (loose)`,
					score: best.score,
				});
				remaining.delete(track.id);
			}
		}
	}

	const phase3RawResults = new Map<string, ItunesSongResult[]>();

	// Phase 3 — strict direct search for tracks with no candidate collection
	// match at all.
	for (const track of tracks) {
		if (!remaining.has(track.id)) continue;

		const direct = await fetchTrackPreviewDirect(track.name, artistName);
		if (direct.matched) {
			updates.set(track.id, direct.previewUrl);
			outcomes.set(track.id, {
				kind: "matched",
				previewUrl: direct.previewUrl,
				source: "direct search",
				score: direct.score,
			});
			remaining.delete(track.id);
		} else {
			updates.set(track.id, null);
			outcomes.set(track.id, { kind: "unmatched", bestScore: direct.bestScore });
			phase3RawResults.set(track.id, direct.rawResults);
		}
	}

	// Phase 4 — loose retry against the same direct-search results Phase 3
	// already fetched, for tracks still unmatched after the strict pass.
	for (const track of tracks) {
		if (!remaining.has(track.id)) continue;

		const rawResults = phase3RawResults.get(track.id);
		if (!rawResults) continue;

		const best = findBestDirectMatchLoose(track.name, rawResults);
		if (best) {
			updates.set(track.id, best.previewUrl);
			outcomes.set(track.id, {
				kind: "matched",
				previewUrl: best.previewUrl,
				source: "direct search (loose)",
				score: best.score,
			});
		}
	}

	return { updates, outcomes, candidateCollections };
}
