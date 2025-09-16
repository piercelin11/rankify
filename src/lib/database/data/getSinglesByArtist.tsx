import { db } from "@/db/client";

export default async function getSinglesByArtist(artistId: string) {

	const singles = await db.track.findMany({
		where: {
			artistId,
			albumId: null,
		},
		include: {
			artist: true,
		},
	});

	return singles;
}
