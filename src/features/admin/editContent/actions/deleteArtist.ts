"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/../auth";
import { runDelete } from "./deleteHelpers";

export default async function deleteArtist(id: string): Promise<AppResponseType> {
	await requireAdmin();

	const outcome = await runDelete("artist", () =>
		db.artist.delete({ where: { id } })
	);
	if (!outcome.ok) return outcome.response;

	await invalidateAdminCache("artist", id);
	redirect("/admin/artist");
}
