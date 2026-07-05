import { searchSongs } from "@/lib/itunes/search";
import { titlesMatch, TRACK_MATCH_THRESHOLD } from "@/lib/itunes/normalize";
import { ItunesSongResult } from "@/lib/itunes/types";

export type DirectMatchResult =
	| { matched: true; previewUrl: string | null; score: number }
	| { matched: false; bestScore?: number; rawResults: ItunesSongResult[] };

/**
 * Strict single-track lookup used only as a last-resort fallback (Phase 3)
 * when album-level matching (resolveAlbumPreviewUrls) couldn't find a
 * candidate. Only checks track-name similarity — artist filtering already
 * happens via the search term itself, and by this point the song is known
 * not to belong to any discovered album collection (e.g. a bonus track only
 * on a deluxe/special edition), so requiring the result's collection name to
 * match the local album name would just reject legitimate recordings. Never
 * falls back to an unrelated result — if no candidate clears the track-name
 * threshold, the result is unmatched.
 */
export async function fetchTrackPreviewDirect(
	trackName: string,
	artistName: string
): Promise<DirectMatchResult> {
	const results = await searchSongs(`${trackName} ${artistName}`);

	let best: { previewUrl: string | null; score: number } | null = null;
	let bestRejectedScore = 0;

	for (const result of results) {
		const trackScore = titlesMatch(result.trackName, trackName);
		if (trackScore < TRACK_MATCH_THRESHOLD) {
			bestRejectedScore = Math.max(bestRejectedScore, trackScore);
			continue;
		}

		if (!best || trackScore > best.score) {
			best = { previewUrl: result.previewUrl, score: trackScore };
		}
	}

	if (best) {
		return { matched: true, previewUrl: best.previewUrl, score: best.score };
	}
	return { matched: false, bestScore: bestRejectedScore || undefined, rawResults: results };
}
