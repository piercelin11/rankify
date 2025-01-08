import { db } from "@/lib/prisma";

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
