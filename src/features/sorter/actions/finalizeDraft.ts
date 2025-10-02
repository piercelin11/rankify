"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { sorterStateSchema, SorterStateType } from "@/types/schemas/sorter";
import { revalidatePath } from "next/cache";

export default async function finalizeDraft(
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
				draftState: validatedDraftState, // 儲存簡化的結果
				status: "DRAFT",
			},
		});
	} catch (error) {
		console.error("Failed to finalize draft:", error);
		return { type: "error", message: "Failed to finalize draft" };
	}

	revalidatePath("/sorter");
	return { type: "success", message: "Ranking completed successfully." };
}
