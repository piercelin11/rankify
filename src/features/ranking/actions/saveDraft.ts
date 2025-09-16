"use server"; 

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";

export default async function saveDraft(
	artistId: string,
	draft: string
) {
	const { id: userId } = await getUserSession();

	const existingDraft = await db.rankingDraft.findFirst({
		where: {
			artistId,
			userId,
		},
	});

	try {
		if (!existingDraft)
			await db.rankingDraft.create({
				data: {
					userId,
					artistId,
					draft,
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
