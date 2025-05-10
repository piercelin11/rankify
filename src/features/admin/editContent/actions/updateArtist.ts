"use server";

import { db } from "@/lib/prisma";
import { AppResponseType } from "@/types/response.types";
import { UpdateArtistType } from "@/types/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function updateArtist(
	artistId: string,
	formData: UpdateArtistType
): Promise<AppResponseType> {
	let isSuccess = false;

	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	if (!artist)
		return { type: "error", message: "Failed to update artist with this id" };
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
		return { type: "error", message: "Failed to update artist." };
	}

	if (isSuccess) {
		revalidateTag("admin-data");
		revalidatePath(`/admin/artist/${artistId}`);
	}
	return { type: "success", message: "Successfully updated album." };
}
