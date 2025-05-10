"use server";

import { db } from "@/lib/prisma";
import { ActionResponse } from "@/types/action";
import { updateAlbumSchema, UpdateAlbumType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateAlbum(
	albumId: string,
	formData: UpdateAlbumType
): Promise<ActionResponse> {
	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
	});

	const validatedField = updateAlbumSchema.safeParse(formData);
	if (!validatedField)
		return { success: false, message: "Invalid Field", error: "Invalid Field" };

	if (!album)
		return { success: false, message: "Failed to update album with this id" };

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
		return { success: false, message: "Failed to update album." };
	}

	revalidatePath(`/admin/album/${albumId}`);
	revalidateTag("admin-data");
	return { success: true, message: "Successfully updated album." };
}
