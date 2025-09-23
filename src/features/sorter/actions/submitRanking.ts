"use server";

import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { $Enums } from "@prisma/client";
import { getUserSession } from "@/../auth";
import { AppResponseType } from "@/types/response";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import createAlbumRanking from "@/features/ranking/actions/createAlbumRanking";
import createRankingSubmission from "../../ranking/actions/createRankingSubmission";

export default async function submitRanking(
	trackRankings: RankingResultData[],
	artistId: string,
	draftId: string,
	type: $Enums.SubmissionType
): Promise<AppResponseType> {
	const { id: userId } = await getUserSession();
	let isSuccess = false;

	try {
		await db.$transaction(async (tx) => {
			const submission = await createRankingSubmission(
				{
					trackRankings,
					userId,
					type,
					albumId: type === "ALBUM" ? (trackRankings[0]?.albumId || undefined) : undefined
				},
				tx
			);

			if (type === "ARTIST") {
				await createAlbumRanking(
					{
						submissionId: submission.id,
						artistId: artistId,
						userId,
						trackRankings,
					},
					tx
				);
			}

			// 更新 RankingSubmission 狀態為已完成
			await tx.rankingSubmission.update({
				where: {
					id: draftId,
				},
				data: {
					status: "COMPLETED",
					completedAt: new Date(),
				},
			});
		});

		isSuccess = true;
	} catch (error) {
		console.error("Failed to submit the rankings:", error);
		return { type: "error", message: "Failed to submit the rankings" };
	}

	if (isSuccess) {
		revalidateTag("user-data");
		redirect(`/artist/${trackRankings[0].artistId}/history`);
	}

	return {
		type: "success",
		message: "You successfully submitted the rankings.",
	};
}
