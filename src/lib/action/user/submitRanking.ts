"use server";

import { RankingResultData } from "@/components/sorter/SorterField";
import { $Enums } from "@prisma/client";
import { getUserSession } from "@/../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import deleteRankingDraft from "./deleteRankingDraft";

export default async function submitRanking(
	data: RankingResultData[],
	type: $Enums.RankingType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();

	let isSuccess = false;

	try {
		await db.rankingSession.create({
			data: {
				userId,
				artistId: data[0].artistId,
				type,
				rankings: {
					createMany: {
						data: await Promise.all(
							data.map(async (data) => {
								const trackLatestRanking = await db.ranking.findFirst({
									where: {
										userId,
										trackId: data.id,
									},
									orderBy: {
										date: {
											date: "desc",
										},
									},
								});
								return {
									ranking: data.ranking,
									trackId: data.id,
									albumId: data.albumId,
									artistId: data.artistId,
									userId,
									rankChange: trackLatestRanking
										? trackLatestRanking.ranking - data.ranking
										: null,
								};
							})
						),
					},
				},
			},
		});
		await deleteRankingDraft(data[0].artistId);
		isSuccess = true;
	} catch (error) {
		console.error("Failed to submit the rankings:", error);
		return { success: false, message: "Failed to submit the rankings" };
	}

	if (isSuccess) {
		revalidateTag("user-data");
		redirect(`/artist/${data[0].artistId}/history`);
	}

	return { success: true, message: "You successfully submitted the rankings." };
}
