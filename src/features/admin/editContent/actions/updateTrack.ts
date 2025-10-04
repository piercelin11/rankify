"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { AlbumData, TrackData } from "@/types/data";
import { updateTrackSchema, UpdateTrackType } from "@/lib/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { ADMIN_MESSAGES } from "@/constants/messages";
import { requireAdmin } from "@/lib/auth/authorization";

type UpdateTrackProps = {
	originalData: TrackData;
	formData: UpdateTrackType;
};

export default async function updateTrack({
	originalData,
	formData,
}: UpdateTrackProps): Promise<AppResponseType> {
	await requireAdmin();

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
					trackNumber: validatedData.trackNumber,
					img: newAlbum.img,
					color: newAlbum.color,
					type: validatedData.type,
					discNumber: validatedData.discNumber ?? originalData.discNumber ?? 1
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
					trackNumber: validatedData.trackNumber,
					discNumber: validatedData.discNumber ?? originalData.discNumber ?? 1,
					img: validatedData.color ? null : originalData.img, // 保留原有圖片，除非有新的顏色
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
		// 重新驗證藝術家頁面，以確保單曲列表更新
		revalidatePath(`/admin/artist/${originalData.artistId}`);
		// 如果原本有專輯，也要重新驗證專輯頁面
		if (originalData.albumId) {
			revalidatePath(`/admin/album/${originalData.albumId}`);
		}
		// 如果現在有新專輯，重新驗證新專輯頁面
		if (newAlbum) {
			revalidatePath(`/admin/album/${newAlbum.id}`);
		}
	}
	return { type: "success", message: ADMIN_MESSAGES.TRACK.UPDATE.SUCCESS };
}
