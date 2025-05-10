"use server";

import { db } from "@/lib/prisma";
import { AppResponseType } from "@/types/response";
import { AlbumData, TrackData } from "@/types/data";
import { updateTrackSchema, UpdateTrackType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { ADMIN_MESSAGES } from "@/constants/messages";

type UpdateTrackProps = {
	originalData: TrackData;
	formData: UpdateTrackType;
};

export default async function updateTrack({
	originalData,
	formData,
}: UpdateTrackProps): Promise<AppResponseType> {
	let isSuccess = false;
	let newAlbum: AlbumData | null;

	const validatedField = updateTrackSchema.safeParse(formData);
	if (!validatedField.success) {
		console.error(
			ADMIN_MESSAGES.TRACK.UPDATE.ERROR_INVALID_FIELDS,
			validatedField.error.flatten()
		);
		return {
			type: "error",
			message: ADMIN_MESSAGES.TRACK.UPDATE.ERROR_INVALID_FIELDS,
		};
	}
	const validatedData = validatedField.data;

	if (validatedData.album) {
		newAlbum = await db.album.findFirst({
			where: {
				artistId: originalData.artistId,
				name: formData.album,
			},
		});

		if (!newAlbum)
			return {
				type: "error",
				message: ADMIN_MESSAGES.TRACK.UPDATE.ERROR_INVALID_FIELDS,
			};
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
					name: validatedData.name,
					albumId: newAlbum.id,
					img: newAlbum.img,
					color: newAlbum.color,
					type: validatedData.type,
				},
			});
		} else {
			await db.track.update({
				where: {
					id: originalData.id,
				},
				data: {
					name: validatedData.name,
					album: {
						disconnect: true,
					},
					type: validatedData.type,
					color: validatedData.color,
				},
			});
		}

		isSuccess = true;
	} catch (error) {
		console.error(ADMIN_MESSAGES.TRACK.UPDATE.FAILURE, error);
		return { type: "error", message: ADMIN_MESSAGES.TRACK.UPDATE.FAILURE };
	}

	if (isSuccess) {
		revalidatePath("/admin");
		revalidateTag("admin-data");
	}
	return { type: "success", message: ADMIN_MESSAGES.TRACK.UPDATE.SUCCESS };
}
