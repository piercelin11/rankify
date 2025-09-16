import { db } from "@/db/client";

export default async function getTracksByArtist(artistId: string, take?: number) {

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
