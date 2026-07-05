"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/../auth";
import { runDelete } from "./deleteHelpers";

export default async function deleteAlbum(id: string): Promise<AppResponseType> {
	await requireAdmin();

	const outcome = await runDelete("album", () =>
		db.album.delete({ where: { id } })
	);
	if (!outcome.ok) return outcome.response;

	const { artistId } = outcome.result;
	await invalidateAdminCache("album", id);
	redirect(`/admin/artist/${artistId}`);
}
