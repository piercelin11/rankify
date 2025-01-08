import { db } from "@/lib/prisma";

export default async function getTracksByAlbum(albumId: string) {
	
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
