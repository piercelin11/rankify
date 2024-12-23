"use server";

import { prisma } from "@/lib/prisma";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function deleteItem(
	type: "artist" | "album" | "track",
	id: string
): Promise<ActionResponse> {
	let isSuccess = false;
	let artistId: null | string = null;

	try {
		switch (type) {
			case "artist":
				await prisma.artist.delete({
					where: {
						id,
					},
				});
				break;
			case "album":
				const deletedAlbum = await prisma.album.delete({
					where: {
						id,
					},
				});
				artistId = deletedAlbum.artistId;
				break;
			case "track":
				await prisma.track.delete({
					where: {
						id,
					},
				});
				break;
		}

		isSuccess = true;
	} catch (error) {
		console.error(`Failed to delete ${type}:`, error);
		return { success: false, message: `Failed to delete ${type}.` };
	}

	if (isSuccess) {
		if (type === "track")revalidatePath("/admin");
		if (type === "album")redirect(`/admin/artist/${artistId}`);
		if (type === "artist")redirect("/admin/artist");
	}
	return { success: true, message: `Successfully deleted ${type}.` };
}
