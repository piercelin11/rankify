import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getSinglesByArtist(artistId: string) {
	"use cache";
	cacheTag("admin-data");

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
