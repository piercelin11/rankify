"use server";

import { db } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchArtist from "@/lib/spotify/fetchArtist";
import { AppResponseType } from "@/types/response.types";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateInfo(
	type: "artist" | "album",
	id: string,
	token?: string
): Promise<AppResponseType> {
	let success = false;

	try {
		if (type === "album") {
			const album = await fetchAlbum(id, token);

			if (!album)
				return { type: "error", message: "Faild to fetch album data." };

			const albumData = await db.album.update({
				where: {
					id,
				},
				data: {
					img: album.images[0].url,
				},
			});
			await db.track.updateMany({
				where: {
					albumId: albumData.id,
				},
				data: {
					img: albumData.img,
				},
			});
		} else {
			const artist = await fetchArtist(id, token);

			if (!artist)
				return { type: "error", message: "Faild to fetch artist data." };

			await db.artist.update({
				where: {
					id,
				},
				data: {
					img: artist.images[0].url,
					spotifyFollowers: artist.followers.total,
				},
			});
		}
		success = true;
	} catch (error) {
		console.error(`Failed to update ${type} info: `, error);
		return { type: "error", message: `Failed to update ${type} info.` };
	}

	if (success) {
		revalidatePath(`/admin/${type}/${id}`);
		revalidateTag("admin-data");
	}
	return { type: "success", message: "Successfully updated album." };
}
