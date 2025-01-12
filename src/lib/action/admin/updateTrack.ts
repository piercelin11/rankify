"use server";

import { db } from "@/lib/prisma";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { ActionResponse } from "@/types/action";
import { AlbumData, TrackData } from "@/types/data";
import { UpdateTrackType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateTrack(
	originalData: TrackData,
	formData: UpdateTrackType
): Promise<ActionResponse> {
	let isSuccess = false;

	let newAlbum: AlbumData | null;

	if (formData.album) {
		newAlbum = await db.album.findFirst({
			where: {
				artistId: originalData.artistId,
				name: formData.album,
			},
		});

		if (!newAlbum) return { success: false, message: "Invalid album name." };
	} else {
		newAlbum = null;
	}

	try {
		if (newAlbum) {
			await db.track.update({
				where: {
					id: originalData.id,
				},
				data: {
					name: formData.name,
					albumId: newAlbum.id,
					img: newAlbum.img,
					type: formData.type,
				},
			});
		} else {
			await db.track.update({
				where: {
					id: originalData.id,
				},
				data: {
					name: formData.name,
					album: {
						disconnect: true,
					},
					type: formData.type,
				},
			});
		}

		isSuccess = true;
	} catch (error) {
		console.error("Failed to update track.", error);
		return { success: false, message: "Failed to update track." };
	}

	if (isSuccess) {
		revalidatePath("/admin");
		revalidateTag("admin-data");
	}
	return { success: true, message: "Successfully updated track." };
}
