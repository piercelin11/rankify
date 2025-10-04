"use server";

import { db } from "@/db/client";
import { $Enums, SubmissionStatus, SubmissionType } from "@prisma/client";
import { getUserSession } from "@/../auth";
import { getTracksByAlbumAndTrackIds } from "@/db/track";
import { sorterFilterSchema, sorterStateSchema } from "@/lib/schemas/sorter";
import { revalidatePath } from "next/cache";
import initializeSorterState from "../utils/initializeSorterState";

type CreateSubmissionProps = {
	selectedAlbumIds: string[];
	selectedTrackIds: string[];
	type: $Enums.SubmissionType;
	artistId: string;
	albumId?: string;
};

export async function createSubmission({
	selectedAlbumIds,
	selectedTrackIds,
	type,
	artistId,
	albumId,
}: CreateSubmissionProps) {
	try {
		// 驗證輸入參數
		const validatedData = sorterFilterSchema.parse({
			selectedAlbumIds,
			selectedTrackIds,
		});

		const { id: userId } = await getUserSession();

		// 獲取符合條件的歌曲
		const tracks = await getTracksByAlbumAndTrackIds({
			selectedAlbumIds: validatedData.selectedAlbumIds,
			selectedTrackIds: validatedData.selectedTrackIds,
		});

		if (tracks.length === 0) {
			throw new Error("沒有找到符合條件的歌曲");
		}

		// 初始化排序狀態
		const draftState = initializeSorterState(tracks);

		const validatedDraftState = sorterStateSchema.parse(draftState);

		// 檢查是否已有進行中的 submission
		const existingSubmission = await db.rankingSubmission.findFirst({
			where: {
				userId,
				artistId,
				type: type as SubmissionType,
				albumId: albumId || null,
				status: {
					in: [SubmissionStatus.IN_PROGRESS, SubmissionStatus.DRAFT],
				},
			},
		});

		revalidatePath("/sorter");

		if (existingSubmission) {
			// 更新現有的 submission
			return await db.rankingSubmission.update({
				where: { id: existingSubmission.id },
				data: {
					draftState: validatedDraftState,
					updatedAt: new Date(),
				},
			});
		}
		// 創建新的 submission
		return await db.rankingSubmission.create({
			data: {
				userId,
				artistId,
				albumId: albumId || null,
				type: type as SubmissionType,
				status: SubmissionStatus.IN_PROGRESS,
				draftState: validatedDraftState,
			},
		});
	} catch (error) {
		console.error("createSubmission error:", error);
		throw error;
	}
}
