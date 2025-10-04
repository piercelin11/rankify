"use server";

import { getUserSession } from "@/../auth";
import { getIncompleteRankingSubmission } from "@/db/ranking";
import { $Enums } from "@prisma/client";

type CheckDraftProps = {
	artistId: string;
	type?: $Enums.SubmissionType;
	albumId?: string;
};

export async function checkDraft({
	artistId,
	type = "ARTIST",
	albumId,
}: CheckDraftProps) {
	try {
		const { id: userId } = await getUserSession();
		const submission = await getIncompleteRankingSubmission({
			artistId,
			userId,
			type,
			albumId,
		});

		if (submission) {
			return {
				hasDraft: true,
				submissionId: submission.id,
				userId: userId,
				status: submission.status,
				date: submission.updatedAt || submission.createdAt,
			};
		}

		return { hasDraft: false };
	} catch (error) {
		console.error("checkDraft error:", error);
		return { hasDraft: false };
	}
}
