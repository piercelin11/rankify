import { db } from "./client";

export async function getArtistById(artistId: string) {
	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});
	return artist;
}

export async function getLoggedArtists(userId: string) {
	const artists = await db.artist.findMany({
		where: {
			albumRankings: {
				some: {
					userId,
				},
			},
		},
		orderBy: {
			albumRankings: {
				_count: "desc",
			},
		},
	});

	return artists;
}
