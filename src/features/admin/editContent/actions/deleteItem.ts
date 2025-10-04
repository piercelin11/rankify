"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";

type DeleteItemProps = {
	type: "artist" | "album" | "track";
	id: string;
};

export default async function deleteItem({
	type,
	id,
}: DeleteItemProps): Promise<AppResponseType> {
	await requireAdmin();

	let isSuccess = false;
	let artistId: null | string = null;

	try {
		switch (type) {
			case "artist":
				await db.artist.delete({
					where: {
						id,
					},
				});
				break;
			case "album":
				const deletedAlbum = await db.album.delete({
					where: {
						id,
					},
				});
				artistId = deletedAlbum.artistId;
				break;
			case "track":
				await db.track.deleteMany({
					where: {
						id,
					},
				});
				break;
		}

		isSuccess = true;
	} catch (error) {
		console.error(ADMIN_MESSAGES.OPERATION_MESSAGES.DELETE.FAILURE(type), error);
		return { type: "error", message: ADMIN_MESSAGES.OPERATION_MESSAGES.DELETE.FAILURE(type) };
	}

	if (isSuccess) {
		if (type === "track") revalidatePath("/admin");
		if (type === "album") redirect(`/admin/artist/${artistId}`);
		if (type === "artist") redirect("/admin/artist");
		revalidateTag("admin-data");
	}
	return { type: "success", message: ADMIN_MESSAGES.OPERATION_MESSAGES.DELETE.SUCCESS(type) };
}
