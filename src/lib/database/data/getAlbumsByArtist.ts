import { db } from "@/db/client";

export default async function getAlbumsByArtist(artistId: string, take?: number) {
	const albums = await db.album.findMany({
		where: {
			artistId,
		},
		include: {
			artist: true,
		},
		orderBy: {
			releaseDate: "desc",
		},
		take
	});

	return albums;
}
