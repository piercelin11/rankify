"use server";

import { db } from "@/lib/prisma";
import { AppResponseType } from "@/types/response.types";
import { AlbumData, TrackData } from "@/types/data.types";
import { UpdateTrackType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateTrack(
	originalData: TrackData,
	formData: UpdateTrackType 
): Promise<AppResponseType> {
	let isSuccess = false;

	let newAlbum: AlbumData | null;

	if (formData.album) {
		newAlbum = await db.album.findFirst({
			where: {
				artistId: originalData.artistId,
				name: formData.album,
			},
		});

		if (!newAlbum) return { type: "error", message: "Invalid album name." };
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
					color: newAlbum.color,
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
					color: formData.color
				},
			});
		}

		isSuccess = true;
	} catch (error) {
		console.error("Failed to update track.", error);
		return { type: "error", message: "Failed to update track." };
	}

	if (isSuccess) {
		revalidatePath("/admin");
		revalidateTag("admin-data");
	}
	return { type: "success", message: "Successfully updated track." };
}
