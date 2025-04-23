"use server";

import { db } from "@/lib/prisma";
import { ActionResponse } from "@/types/action";
import { updateAlbumType } from "@/types/schemas/admin";
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

	} catch (error) {
		console.error("Failed to update album.", error);
		return { success: false, message: "Failed to update album." };
	} 

	revalidatePath(`/admin/album/${albumId}`);
	revalidateTag("admin-data");
	return ({ success: true, message: "Successfully updated album." });
	
}
