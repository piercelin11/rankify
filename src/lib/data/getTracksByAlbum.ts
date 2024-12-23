import { prisma } from "@/lib/prisma";

export default async function getTracksByAlbum(albumId: string) {
	const tracks = await prisma.track.findMany({
		where: {
			albumId,
		},
		include: {
			artist: true,
			album: true,
		},
	});

	return tracks.sort((a, b) => {
		if (a.trackNumber && b.trackNumber) return a.trackNumber - b.trackNumber;
		else return 1;
	});
}
