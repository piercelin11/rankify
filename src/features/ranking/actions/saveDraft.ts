"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { $Enums } from "@prisma/client";

export default async function saveDraft(
	artistId: string,
	draft: string,
	type: $Enums.SubmissionType,
	albumId?: string
) {
	const { id: userId } = await getUserSession();

	const existingDraft = await db.rankingSubmission.findFirst({
		where: {
			artistId,
			userId,
			type,
			albumId: albumId || null,
			status: "DRAFT",
		},
	});

	try {
		if (!existingDraft)
			await db.rankingSubmission.create({
				data: {
					userId,
					artistId,
					rankingState: draft,
					type,
					albumId: albumId || null,
					status: "DRAFT",
				},
			});
		else
			await db.rankingSubmission.update({
				where: {
					id: existingDraft.id,
				},
				data: {
					rankingState: draft,
				},
			});

	} catch (error) {
		console.error("Failed to save draft:", error);
		return { type: "error", message: "Failed to save draft" };
	}

	return { type: "success", message: "Draft is successfully saved." };
}
