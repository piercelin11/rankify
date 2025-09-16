import { db } from "@/db/client";

export default async function getAlbumById(albumId: string) {

	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
		include: {
			artist: true,
			//tracks: true,
		}
	});

	return album;
}
