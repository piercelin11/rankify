"use server";

import { requireSession } from "@/../auth";
import { db } from "@/db/client";
import { TrackData } from "@/types/guest";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/constants/cacheTags";

type CreateCompletedParams = {
	albumId: string;
	artistId: string;
	rankedList: string[]; // trackId 陣列
	tracks: TrackData[];
};

export async function createCompletedSubmission({
	albumId,
	artistId,
	rankedList,
	tracks: _tracks,
}: CreateCompletedParams) {
	try {
		const { id: userId } = await requireSession();

		// 檢查是否已有 DRAFT,有則直接刪除 (覆蓋策略)
		const existingDraft = await db.rankingSubmission.findFirst({
			where: {
				userId,
				albumId,
				status: { in: ["IN_PROGRESS", "DRAFT"] },
			},
		});

		if (existingDraft) {
			await db.rankingSubmission.delete({ where: { id: existingDraft.id } });
		}

		// 直接建立 COMPLETED 狀態的 submission
		const submission = await db.rankingSubmission.create({
			data: {
				userId,
				albumId,
				artistId,
				type: "ALBUM",
				status: "COMPLETED",
				completedAt: new Date(),
			},
		});

		// 建立 TrackRanking records (模仿 completeSubmission.ts)
		const countTrack = rankedList.length;
		const trackRankData = rankedList.map((trackId, index) => {
			const rank = index + 1;
			const rankPercentile = rank / countTrack;

			return {
				rank,
				rankPercentile,
				rankChange: null, // Guest 沒有歷史排名
				submissionId: submission.id,
				trackId,
				userId,
				artistId,
			};
		});

		await db.trackRanking.createMany({
			data: trackRankData,
		});

		// 快取失效
		revalidateTag(CACHE_TAGS.USER_DYNAMIC(userId), 'max');
		revalidateTag(CACHE_TAGS.RANKING(userId, artistId), 'max');

		return { success: true, submissionId: submission.id };
	} catch (error) {
		console.error("createCompletedSubmission error:", error);
		return { success: false, error: "Failed to create submission" };
	}
}
