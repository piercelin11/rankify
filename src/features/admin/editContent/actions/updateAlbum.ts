"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import { db } from "@/lib/prisma";
import { AppResponseType } from "@/types/response";
import { updateAlbumSchema, UpdateAlbumType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

type UpdateAlbumProps = {
	albumId: string;
	formData: UpdateAlbumType;
};

export default async function updateAlbum({
	albumId,
	formData,
}: UpdateAlbumProps): Promise<AppResponseType> {
	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
	});

	if (!album)
		return {
			type: "error",
			message: ADMIN_MESSAGES.ALBUM.UPDATE.ERROR_NOT_FOUND,
		};

	const validatedField = updateAlbumSchema.safeParse(formData);
	if (!validatedField.success) {
		console.error(
			ADMIN_MESSAGES.ALBUM.UPDATE.ERROR_INVALID_FIELDS,
			validatedField.error.flatten()
		);
		return {
			type: "error",
			message: ADMIN_MESSAGES.ALBUM.UPDATE.ERROR_INVALID_FIELDS,
		};
	}
	const validatedData = validatedField.data;

	try {
		await db.$transaction(async (tx) => {
			const album = await tx.album.update({
				where: {
					id: albumId,
				},
				data: {
					name: validatedData.name,
					color: validatedData.color,
					img: validatedData.img,
				},
			});

			await tx.track.updateMany({
				where: {
					albumId: album.id,
				},
				data: {
					img: album.img,
				},
			});
		});
	} catch (error) {
		console.error(ADMIN_MESSAGES.ALBUM.UPDATE.FAILURE, error);
		return { type: "error", message: ADMIN_MESSAGES.ALBUM.UPDATE.FAILURE };
	}

	revalidatePath(`/admin/album/${albumId}`);
	revalidateTag("admin-data");
	return { type: "success", message: ADMIN_MESSAGES.ALBUM.UPDATE.SUCCESS };
}
