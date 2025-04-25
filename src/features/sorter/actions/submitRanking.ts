"use server";

import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { $Enums } from "@prisma/client";
import { getUserSession } from "@/../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import deleteRankingDraft from "./deleteRankingDraft";
import createAlbumRanking from "@/features/sorter/actions/createAlbumRanking";

export default async function submitRanking(
	trackRankings: RankingResultData[],
	artistId: string,
	type: $Enums.RankingType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();
	const countTrack = trackRankings.length;
	let isSuccess = false;

	try {
		const trackIds = trackRankings.map((track) => track.id);

		const previousRankings = await db.ranking.findMany({
			where: {
				userId,
				trackId: { in: trackIds },
			},
			distinct: ["trackId"],
			orderBy: {
				date: { date: "desc" },
			},
			select: { trackId: true, ranking: true, artistId: true },
		});

		const prevRankingMap = new Map(
			previousRankings.map((r) => [r.trackId, r.ranking])
		);

		const sessionCreateData = trackRankings.map((data) => {
			const previousRank = prevRankingMap.get(data.id);
			const rankChange =
				previousRank !== undefined && previousRank !== null
					? previousRank - data.ranking
					: null;
			const rankPercentile = data.ranking / countTrack;

			return {
				ranking: data.ranking,
				trackId: data.id,
				albumId: data.albumId,
				artistId,
				userId,
				rankPercentile,
				rankChange,
			};
		});

		await db.$transaction(async (tx) => {
			const session = await tx.rankingSession.create({
				data: {
					userId,
					artistId: artistId,
					type,
					rankings: { createMany: { data: sessionCreateData } },
				},
			});

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
		return { success: false, message: "Failed to submit the rankings" };
	}

	if (isSuccess) {
		revalidateTag("user-data");
		redirect(`/artist/${trackRankings[0].artistId}/history`);
	}

	return { success: true, message: "You successfully submitted the rankings." };
}
