"use server";

import { db } from "@/db/client";
import { ADMIN_MESSAGES } from "@/constants/messages";
import { AppResponseType } from "@/types/response";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/../auth";
import { runDelete } from "./deleteHelpers";

export default async function deleteTrack(id: string): Promise<AppResponseType> {
	await requireAdmin();

	const outcome = await runDelete("track", () =>
		db.track.deleteMany({ where: { id } })
	);
	if (!outcome.ok) return outcome.response;

	await invalidateAdminCache("track", id);
	revalidatePath("/admin");
	return {
		type: "success",
		message: ADMIN_MESSAGES.OPERATION_MESSAGES.DELETE.SUCCESS("track"),
	};
}
