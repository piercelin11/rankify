"use server";

import { db } from "@/db/client";
import { LabArtistData } from "./types";

// Deliberately no "use cache" — the lab page needs every read to reflect
// the current DB state so parameter tweaks aren't masked by stale cache.
export async function getRawTrackStats(
	artistId: string,
	userId: string
): Promise<LabArtistData | null> {
	const artist = await db.artist.findUnique({
		where: { id: artistId },
		select: { id: true, name: true },
	});
	if (!artist) return null;

	const trackStats = await db.trackStat.findMany({
		where: { artistId, userId },
		select: {
			overallRank: true,
			track: {
				select: {
					id: true,
					name: true,
					albumId: true,
					album: {
						select: {
							id: true,
							name: true,
							color: true,
							img: true,
							releaseDate: true,
						},
					},
				},
			},
		},
		orderBy: { overallRank: "asc" },
	});

	const albumsById = new Map<string, LabArtistData["albums"][number]>();
	for (const stat of trackStats) {
		const album = stat.track.album;
		if (album && !albumsById.has(album.id)) {
			albumsById.set(album.id, {
				id: album.id,
				name: album.name,
				color: album.color,
				img: album.img,
				releaseDate: album.releaseDate,
			});
		}
	}

	return {
		artistId: artist.id,
		artistName: artist.name,
		tracks: trackStats.map((stat) => ({
			trackId: stat.track.id,
			trackName: stat.track.name,
			albumId: stat.track.albumId,
			overallRank: stat.overallRank,
		})),
		albums: Array.from(albumsById.values()),
	};
}
