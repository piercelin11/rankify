import { prisma } from "@/lib/prisma";

export default async function getArtistById(artistId: string) {
	const artist = await prisma.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	return artist;
}
