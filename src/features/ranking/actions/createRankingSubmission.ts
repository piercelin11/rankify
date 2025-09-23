import { db } from "@/db/client";
import { SubmissionStatus, Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { RankingResultData } from "../../sorter/components/SortingStage";

type CreateRankingSubmissionProps = {
	trackRankings: RankingResultData[];
	userId: string;
	type: string;
	albumId?: string;
	draftId?: string;
};

export default async function createRankingSubmission(
	{ trackRankings, userId, type, albumId, draftId }: CreateRankingSubmissionProps,
	prisma: PrismaClient | Prisma.TransactionClient
) {
	const countTrack = trackRankings.length;
	const trackIds = trackRankings.map((track) => track.id);

	// 取得之前的排名來計算變化
	const previousRankings = await db.trackRanking.findMany({
		where: {
			userId,
			trackId: { in: trackIds },
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

	// 1. 先處理現有的 draft submission 或創建新的
	let submission;
	if (draftId) {
		// 查找對應的 draft submission (可能是從 RankingDraft 轉移過來的，也可能是新的)
		const existingDraft = await prisma.rankingSubmission.findFirst({
			where: {
				userId,
				artistId: trackRankings[0].artistId,
				type,
				albumId: albumId || null,
				status: {
					in: [SubmissionStatus.DRAFT, SubmissionStatus.IN_PROGRESS],
				},
			},
		});

		if (existingDraft) {
			// 更新現有的 draft 為 completed
			submission = await prisma.rankingSubmission.update({
				where: { id: existingDraft.id },
				data: {
					status: SubmissionStatus.COMPLETED,
					completedAt: new Date(),
					rankingState: { trackRankings }, // 保存最終結果
				},
			});
		} else {
			// 創建新的 submission
			submission = await prisma.rankingSubmission.create({
				data: {
					userId,
					artistId: trackRankings[0].artistId,
					type,
					albumId: albumId || null,
					status: SubmissionStatus.COMPLETED,
					completedAt: new Date(),
					rankingState: { trackRankings },
				},
			});
		}
	} else {
		// 直接創建完成的 submission
		submission = await prisma.rankingSubmission.create({
			data: {
				userId,
				artistId: trackRankings[0].artistId,
				type,
				albumId: albumId || null,
				status: SubmissionStatus.COMPLETED,
				completedAt: new Date(),
				rankingState: { trackRankings },
			},
		});
	}

	// 2. 創建 TrackRanking 記錄
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
			submissionId: submission.id,
			trackId: data.id,
			userId,
			artistId: trackRankings[0].artistId,
		};
	});

	await prisma.trackRanking.createMany({
		data: trackRankData,
	});

	return submission;
}