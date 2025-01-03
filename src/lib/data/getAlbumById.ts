import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function getAlbumById(albumId: string) {
	"use cache";
	cacheTag("admin-data");

	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
	});

	return album;
}
