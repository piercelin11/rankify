"use server";

import { db } from "@/lib/prisma";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { ActionResponse } from "@/types/action";
import { AlbumData, TrackData } from "@/types/data";
import { updateAlbumType, UpdateTrackType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateAlbum(
	albumId: string,
	formData: updateAlbumType
): Promise<ActionResponse> {
	let isSuccess = false;

	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
	});

	if (!album)
		return { success: false, message: "Failed to update album with this id" };

	try {
		await db.album.update({
			where: {
				id: albumId,
			},
			data: {
				name: formData.name,
				color: formData.color,
			},
		});

		isSuccess = true;
	} catch (error) {
		console.error("Failed to update album.", error);
		return { success: false, message: "Failed to update album." };
	}

	if (isSuccess) {
		revalidatePath(`/admin/album/${albumId}`);
		revalidateTag("admin-data");
	}
	return { success: true, message: "Successfully updated album." };
}
