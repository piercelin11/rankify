"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { updateArtistSchema, UpdateArtistType } from "@/lib/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";

type UpdateArtistProps = {
	artistId: string;
	formData: UpdateArtistType;
};
export default async function updateArtist({
	artistId,
	formData,
}: UpdateArtistProps): Promise<AppResponseType> {
	await requireAdmin();

	let isSuccess = false;

	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	const validatedField = updateArtistSchema.safeParse(formData);
	if (!validatedField.success) {
		console.error(
			ADMIN_MESSAGES.ARTIST.UPDATE.ERROR_INVALID_FIELDS,
			validatedField.error.flatten()
		);
		return {
			type: "error",
			message: ADMIN_MESSAGES.ARTIST.UPDATE.ERROR_INVALID_FIELDS,
		};
	}
	const validatedData = validatedField.data;

	if (!artist)
		return {
			type: "error",
			message: ADMIN_MESSAGES.ARTIST.UPDATE.ERROR_NOT_FOUND,
		};
	try {
		await db.artist.update({
			where: {
				id: artistId,
			},
			data: {
				name: validatedData.name,
			},
		});

		isSuccess = true;
	} catch (error) {
		console.error(ADMIN_MESSAGES.ARTIST.UPDATE.FAILURE, error);
		return { type: "error", message: ADMIN_MESSAGES.ARTIST.UPDATE.FAILURE };
	}

	if (isSuccess) {
		revalidateTag("admin-data");
		revalidatePath(`/admin/artist/${artistId}`);
	}
	return { type: "success", message: ADMIN_MESSAGES.ARTIST.UPDATE.SUCCESS };
}
