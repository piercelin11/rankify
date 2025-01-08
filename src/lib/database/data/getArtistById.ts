import { db } from "@/lib/prisma";

export default async function getArtistById(artistId: string) {

	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	return artist;
}
