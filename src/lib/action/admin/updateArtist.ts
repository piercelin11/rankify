"use server";

import { db } from "@/lib/prisma";
import { ActionResponse } from "@/types/action";
import { updateArtistType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateArtist(
	artistId: string,
	formData: updateArtistType
): Promise<ActionResponse> {
	let isSuccess = false;

	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	if (!artist)
		return { success: false, message: "Failed to update artist with this id" };
	try {
		await db.artist.update({
			where: {
				id: artistId,
			},
			data: {
				name: formData.name,
			},
		});

		isSuccess = true;
	} catch (error) {
		console.error("Failed to update artist.", error);
		return { success: false, message: "Failed to update artist." };
	}

	if (isSuccess) {
		revalidateTag("admin-data");
		revalidatePath(`/admin/artist/${artistId}`);
	}
	return { success: true, message: "Successfully updated album." };
}
