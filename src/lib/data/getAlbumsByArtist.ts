import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getAlbumsByArtist(artistId: string, take?: number) {
	"use cache";
	cacheTag("admin-data");

	const albums = await db.album.findMany({
		where: {
			artistId,
		},
		include: {
			artist: true,
		},
		orderBy: {
			releaseDate: "desc",
		},
		take
	});

	return albums;
}
