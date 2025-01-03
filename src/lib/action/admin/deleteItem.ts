"use server";

import { db } from "@/lib/prisma";
import { ActionResponse } from "@/types/action";
import { revalidatePath, revalidateTag } from "next/cache";
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
				await db.artist.delete({
					where: {
						id,
					},
				});
				break;
			case "album":
				const deletedAlbum = await db.album.delete({
					where: {
						id,
					},
				});
				artistId = deletedAlbum.artistId;
				break;
			case "track":
				await db.track.deleteMany({
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
		revalidateTag("admin-data")
	}
	return { success: true, message: `Successfully deleted ${type}.` };
}
