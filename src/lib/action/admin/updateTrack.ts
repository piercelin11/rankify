"use server";

import { prisma } from "@/lib/prisma";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { ActionResponse } from "@/types/action";
import { AlbumData, TrackData } from "@/types/data";
import { updateTrackType } from "@/types/schemas/admin";
import { revalidatePath } from "next/cache";

export default async function updateTrack(
	originalData: TrackData,
	formData: updateTrackType
): Promise<ActionResponse> {
	let isSuccess = false;

	let newAlbum: AlbumData | null;

	if (formData.album) {
		newAlbum = await prisma.album.findFirst({
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
			await prisma.track.update({
				where: {
					id: originalData.id,
				},
				data: {
					name: formData.name,
					albumId: newAlbum.id,
					img: newAlbum.img,
				},
			});
		} else {
			await prisma.track.update({
				where: {
					id: originalData.id,
				},
				data: {
					name: formData.name,
                    album: {
                        disconnect: true
                    }
				},
			});
		}

		isSuccess = true;
	} catch (error) {
		console.error("Failed to update track.", error);
		return { success: false, message: "Failed to update track." };
	}

	if (isSuccess) revalidatePath("/admin");
	return { success: true, message: "Successfully updated track." };
}
