import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getTrackById(trackId: string) {
	"use cache";
	cacheTag("admin-data");
    
	const album = await db.track.findFirst({
		where: {
			id: trackId,
		},
		include: {
			artist: true,
			album: true,
		},
	});

	return album;
}
