import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getTracksByArtist(artistId: string, take?: number) {
	"use cache";
	cacheTag("admin-data");

	const tracks = await db.track.findMany({
		where: {
			artistId,
		},
		include: {
			artist: true,
			album: true,
		},
		take
	});

	return tracks;
}
