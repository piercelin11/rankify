import {
	calculateAlbumPointsSandbox,
	DEFAULT_PARAMS,
} from "./calculateAlbumPoints.sandbox";
import { calculateUnweightedAlbumScore } from "./calculateUnweightedScore";
import { LabArtistData } from "./types";

export type SandboxAlbumAverage = {
	albumId: string;
	name: string;
	color: string | null;
	releaseDate: Date;
	score: number;
};

// TEMPORARY(sandbox): Computes on read from TrackStat.overallRank
// (LabArtistData.tracks) — not backfilled into AlbumStat, see
// calculateAlbumPoints.sandbox.ts header. Remove once a formula is finalized.
export function getSandboxWeightedAlbumAverages(
	data: LabArtistData
): SandboxAlbumAverage[] {
	const results = calculateAlbumPointsSandbox(
		data.tracks.map((t) => ({ albumId: t.albumId, rank: t.overallRank })),
		DEFAULT_PARAMS
	);
	return toSandboxAlbumAverages(results, data);
}

export function getSandboxUnweightedAlbumAverages(
	data: LabArtistData
): SandboxAlbumAverage[] {
	const results = calculateUnweightedAlbumScore(
		data.tracks.map((t) => ({ albumId: t.albumId, rank: t.overallRank }))
	);
	return toSandboxAlbumAverages(results, data);
}

function toSandboxAlbumAverages(
	results: { albumId: string; score: number }[],
	data: LabArtistData
): SandboxAlbumAverage[] {
	const albumsById = new Map(data.albums.map((album) => [album.id, album]));
	return results
		.map((result) => {
			const album = albumsById.get(result.albumId);
			if (!album) return null;
			return {
				albumId: album.id,
				name: album.name,
				color: album.color,
				releaseDate: album.releaseDate,
				score: result.score,
			};
		})
		.filter((item): item is SandboxAlbumAverage => item !== null);
}
