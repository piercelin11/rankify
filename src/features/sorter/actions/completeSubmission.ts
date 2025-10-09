"use server";

import { db } from "@/db/client";
import { Prisma } from "@prisma/client";
import { RankingResultData } from "../types";
import { getUserSession } from "@/../auth";
import { revalidatePath } from "next/cache";
import { calculateAlbumPoints } from "../utils/calculateAlbumPoints";

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
				const albumStats = calculateAlbumPoints(trackRankings);
				const result = albumStats.map((stats, index) => ({
					submissionId,
					artistId: existingSubmission.artistId,
					userId,
					rank: index + 1,
					albumId: stats.albumId,
					points: stats.points,
					basePoints: stats.basePoints,
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
			}
		});

		revalidatePath(`/artist/${trackRankings[0].artistId}`);
		return { type: "success", message: "Submission completed" };
	} catch (error) {
		console.error("completeSubmission error:", error);
		return { type: "error", message: "Failed to complete submission" };
	}
}

async function updateTrackStats(
	tx: Prisma.TransactionClient,
	userId: string,
	artistId: string,
	trackRankData: Array<{
		trackId: string;
		rank: number;
		rankChange: number | null;
	}>
) {
	const trackIds = trackRankData.map((t) => t.trackId);
	const oldStatsArray = await tx.trackStats.findMany({
		where: { userId, trackId: { in: trackIds } },
	});
	const oldStatsMap = new Map(oldStatsArray.map((s) => [s.trackId, s]));

	for (const track of trackRankData) {
		const oldStats = oldStatsMap.get(track.trackId);
		const currentRank = track.rank;
		const rankChange = track.rankChange;

		const submissionCount = (oldStats?.submissionCount ?? 0) + 1;
		const previousAverageRank = oldStats?.averageRank ?? null;
		const averageRank =
			previousAverageRank !== null
				? (previousAverageRank * (submissionCount - 1) + currentRank) /
					submissionCount
				: currentRank;

		const highestRank = Math.min(
			oldStats?.highestRank ?? Infinity,
			currentRank
		);
		const lowestRank = Math.max(oldStats?.lowestRank ?? 0, currentRank);

		let hotStreak = 0;
		let coldStreak = 0;
		if (rankChange !== null) {
			if (rankChange > 0) {
				hotStreak = (oldStats?.hotStreak ?? 0) + 1;
			} else if (rankChange < 0) {
				coldStreak = (oldStats?.coldStreak ?? 0) + 1;
			}
		}

		const cumulativeRankChange =
			rankChange !== null
				? (oldStats?.cumulativeRankChange ?? 0) + Math.abs(rankChange)
				: (oldStats?.cumulativeRankChange ?? 0);

		await tx.trackStats.upsert({
			where: { userId_trackId: { userId, trackId: track.trackId } },
			create: {
				userId,
				artistId,
				trackId: track.trackId,
				overallRank: 0,
				previousOverallRank: null,
				overallRankChange: null,
				submissionCount,
				averageRank,
				previousAverageRank: null,
				highestRank,
				lowestRank,
				hotStreak,
				coldStreak,
				cumulativeRankChange,
			},
			update: {
				submissionCount,
				averageRank,
				previousAverageRank,
				highestRank,
				lowestRank,
				hotStreak,
				coldStreak,
				cumulativeRankChange,
			},
		});
	}

	const allStats = await tx.trackStats.findMany({
		where: { userId, artistId },
		orderBy: [
			{ averageRank: "asc" },
			{ highestRank: "asc" },
			{ lowestRank: "asc" },
			{ trackId: "desc" },
		],
	});

	for (let i = 0; i < allStats.length; i++) {
		const stat = allStats[i];
		const newOverallRank = i + 1;
		const overallRankChange = stat.overallRank
			? stat.overallRank - newOverallRank
			: null;

		await tx.trackStats.update({
			where: { id: stat.id },
			data: {
				previousOverallRank: stat.overallRank,
				overallRank: newOverallRank,
				overallRankChange,
			},
		});
	}
}