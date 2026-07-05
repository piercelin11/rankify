"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { updateTrackCoverSchema, UpdateTrackCoverType } from "@/lib/schemas/admin";
import { revalidatePath } from "next/cache";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";
import { ADMIN_MESSAGES } from "@/constants/messages";
import { requireAdmin } from "@/../auth";

type UpdateTrackCoverProps = {
	trackId: string;
	formData: UpdateTrackCoverType;
};

export default async function updateTrackCover({
	trackId,
	formData,
}: UpdateTrackCoverProps): Promise<AppResponseType> {
	try {
		await requireAdmin();

		const track = await db.track.findFirst({ where: { id: trackId } });
		if (!track) {
			return {
				type: "error",
				message: ADMIN_MESSAGES.TRACK.UPDATE.ERROR_NOT_FOUND,
			};
		}

		const validatedField = updateTrackCoverSchema.safeParse(formData);
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

		try {
			await db.track.update({
				where: { id: trackId },
				data: {
					img: validatedData.img,
					color: validatedData.color,
				},
			});
		} catch (error) {
			console.error(ADMIN_MESSAGES.TRACK.UPDATE.FAILURE, error);
			return { type: "error", message: ADMIN_MESSAGES.TRACK.UPDATE.FAILURE };
		}

		revalidatePath("/admin");
		revalidatePath(`/admin/artist/${track.artistId}`);
		if (track.albumId) {
			revalidatePath(`/admin/album/${track.albumId}`);
		}
		await invalidateAdminCache("track", trackId);

		return { type: "success", message: ADMIN_MESSAGES.TRACK.UPDATE.SUCCESS };
	} catch (error) {
		console.error("updateTrackCover error:", error);
		return { type: "error", message: ADMIN_MESSAGES.TRACK.UPDATE.FAILURE };
	}
}
