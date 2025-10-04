"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { sorterStateSchema, SorterStateType } from "@/lib/schemas/sorter";

export default async function saveDraft(
	draftState: SorterStateType,
	submissionId: string
) {
	const { id: userId } = await getUserSession();

	const existingSubmission = await db.rankingSubmission.findUnique({
		where: {
			id: submissionId,
			userId,
		},
	});

	if (!existingSubmission) return { type: "error", message: "Draft not found" };

	try {
		const validatedDraftState = sorterStateSchema.parse(draftState);
		await db.rankingSubmission.update({
			where: {
				id: existingSubmission.id,
			},
			data: {
				draftState: validatedDraftState,
				status: "IN_PROGRESS"
			},
		});
	} catch (error) {
		console.error("Failed to save draft:", error);
		return { type: "error", message: "Failed to save draft" };
	}

	return { type: "success", message: "Draft is successfully saved." };
}
