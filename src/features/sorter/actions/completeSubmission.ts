"use server";

import { db } from "@/db/client";
import { Prisma } from "@prisma/client";
import { RankingResultData } from "../types";
import { getUserSession } from "@/../auth";
import { revalidatePath } from "next/cache";
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
import { updateAlbumStats } from "@/services/album/updateAlbumStats";
import { updateTrackStats } from "@/services/track/updateTrackStats";

type CompleteSubmissionProps = {
	trackRankings: RankingResultData[];
	submissionId: string;
};

export default async function completeSubmission({
	trackRankings,
	submissionId,
}: CompleteSubmissionProps) {
	try {
		const { id: userId } = await getUserSession();
		const countTrack = trackRankings.length;
		const trackIds = trackRankings.map((track) => track.id);

		await db.$transaction(async (tx) => {
			const existingSubmission = await tx.rankingSubmission.findUnique({
				where: {
					id: submissionId,
					userId,
				},
			});

			if (!existingSubmission) {
				throw new Error("Submission not found");
			}

			// 為計算排名變化做準備
			const previousRankings = await tx.trackRanking.findMany({
				where: {
					userId,
					trackId: { in: trackIds },
					submission: {
						type: existingSubmission.type,
					},
				},
				distinct: ["trackId"],
				orderBy: {
					submission: { createdAt: "desc" },
				},
				select: { trackId: true, rank: true, artistId: true },
			});

			const prevRankingMap = new Map(
				previousRankings.map((ranking) => [ranking.trackId, ranking.rank])
			);

			await tx.rankingSubmission.update({
				where: {
					id: existingSubmission.id,
					userId,
				},
				data: {
					status: "COMPLETED",
					draftState: Prisma.JsonNull,
					completedAt: new Date(),
				},
			});

			// 創建 TrackRanking 記錄
			const trackRankData = trackRankings.map((data) => {
				const previousRank = prevRankingMap.get(data.id);
				const rankChange =
					previousRank !== undefined && previousRank !== null
						? previousRank - data.ranking
						: null;
				const rankPercentile = data.ranking / countTrack;

				return {
					rank: data.ranking,
					rankPercentile,
					rankChange,
					submissionId,
					trackId: data.id,
					userId,
					artistId: existingSubmission.artistId,
				};
			});

			await tx.trackRanking.createMany({
				data: trackRankData,
			});

			// 創建 AlbumRanking 記錄
			if (existingSubmission.type === "ARTIST") {
				const albumStats = calculateAlbumPoints(
					trackRankings.map((t) => ({
						albumId: t.albumId,
						rank: t.ranking,
					}))
				);
				const result = albumStats.map((stats, index) => ({
					submissionId,
					artistId: existingSubmission.artistId,
					userId,
					rank: index + 1,
					albumId: stats.albumId,
					points: stats.points,
					averageTrackRank: stats.averageTrackRanking,
				}));

				await tx.albumRanking.createMany({
					data: result,
				});

				// 更新 TrackStats
				await updateTrackStats(
					tx,
					userId,
					existingSubmission.artistId,
					trackRankData.map((t) => ({
						trackId: t.trackId,
						rank: t.rank,
						rankChange: t.rankChange,
					}))
				);

				// 更新 AlbumStats（基於 TrackStats）
				await updateAlbumStats(tx, userId, existingSubmission.artistId);
			}
		});

		revalidatePath(`/artist/${trackRankings[0].artistId}`);
		return { type: "success", message: "Submission completed" };
	} catch (error) {
		console.error("completeSubmission error:", error);
		return { type: "error", message: "Failed to complete submission" };
	}
}
