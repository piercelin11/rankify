"use server";

import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { $Enums } from "@prisma/client";
import { getUserSession } from "@/../auth";
import { AppResponseType } from "@/types/response";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import createAlbumRanking from "@/features/ranking/actions/createAlbumRanking";
import createRankingSession from "../../ranking/actions/createRankingSession";

export default async function submitRanking(
	trackRankings: RankingResultData[],
	artistId: string,
	type: $Enums.RankingType
): Promise<AppResponseType> {
	const { id: userId } = await getUserSession();
	let isSuccess = false;

	try {
		await db.$transaction(async (tx) => {
			const session = await createRankingSession({trackRankings, userId, type}, tx);

			await createAlbumRanking(
				{
					dateId: session.id,
					artistId: artistId,
					userId,
					trackRankings,
				},
				tx
			);

			await tx.rankingDraft.deleteMany({
				where: {
					artistId,
					userId,
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

	return { type: "success", message: "You successfully submitted the rankings." };
}
