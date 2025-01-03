import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getArtistById(artistId: string) {
	"use cache";
	cacheTag("admin-data");

	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	return artist;
}
