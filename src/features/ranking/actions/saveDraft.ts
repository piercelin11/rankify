"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { $Enums } from "@prisma/client";

export default async function saveDraft(
	artistId: string,
	draft: string,
	type: $Enums.RankingType,
	albumId?: string
) {
	const { id: userId } = await getUserSession();

	const existingDraft = await db.rankingDraft.findFirst({
		where: {
			artistId,
			userId,
			type,
			albumId: albumId || null,
		},
	});

	try {
		if (!existingDraft)
			await db.rankingDraft.create({
				data: {
					userId,
					artistId,
					draft,
					type,
					albumId: albumId || null,
				},
			});
		else
			await db.rankingDraft.update({
				where: {
					id: existingDraft.id,
				},
				data: {
					draft,
				},
			});

	} catch (error) {
		console.error("Failed to save draft:", error);
		return { type: "error", message: "Failed to save draft" };
	}

	return { type: "success", message: "Draft is successfully saved." };
}
