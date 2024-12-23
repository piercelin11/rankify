"use server";

import { prisma } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchArtist from "@/lib/spotify/fetchArtist";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

export default async function updateInfo(
	type: "artist" | "album",
	id: string
): Promise<ActionResponse> {
	let success = false;

	try {
		if (type === "album") {
			const album = await fetchAlbum(id);

			if (!album)
				return { success: false, message: "Faild to fetch album data." };

			await prisma.album.update({
				where: {
					id,
				},
				data: {
					img: album.images[0].url,
				},
			});
		} else {
			const artist = await fetchArtist(id);

			if (!artist)
				return { success: false, message: "Faild to fetch artist data." };

			await prisma.artist.update({
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
		return { success: false, message: `Failed to update ${type} info.` };
	}

	if (success) revalidatePath(`/admin/${type}/${id}`);
	return { success: true, message: "Successfully updated album." };
}
