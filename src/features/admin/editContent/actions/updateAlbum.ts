"use server";

import { db } from "@/lib/prisma";
import { AppResponseType } from "@/types/response.types";
import { updateAlbumSchema, UpdateAlbumType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateAlbum(
	albumId: string,
	formData: UpdateAlbumType
): Promise<AppResponseType> {
	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
	});

	const validatedField = updateAlbumSchema.safeParse(formData);
	if (!validatedField)
		return { type: "error", message: "Invalid Field", error: "Invalid Field" };

	if (!album)
		return { type: "error", message: "Failed to update album with this id" };

	try {
		await db.$transaction(async (tx) => {
			const album = await tx.album.update({
				where: {
					id: albumId,
				},
				data: {
					name: formData.name,
					color: formData.color,
					img: formData.img,
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
		console.error("Failed to update album.", error);
		return { type: "error", message: "Failed to update album." };
	}

	revalidatePath(`/admin/album/${albumId}`);
	revalidateTag("admin-data");
	return { type: "success", message: "Successfully updated album." };
}
