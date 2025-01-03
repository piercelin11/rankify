import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getTracksByAlbum(albumId: string) {
	"use cache";
	cacheTag("admin-data");
	
	const tracks = await db.track.findMany({
		where: {
			albumId,
		},
		include: {
			artist: true,
			album: true,
		},
		orderBy: [
			{
				discNumber: { sort: "asc", nulls: "last" },
			},
			{ trackNumber: "asc" },
		],
	});

	return tracks;
}
