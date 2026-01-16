'use server';

import { db } from '@/db/client';
import { $Enums, SubmissionStatus, SubmissionType } from '@prisma/client';
import { requireSession } from '@/../auth';
import { getTracksByAlbumAndTrackIds } from '@/db/track';
import { sorterFilterSchema, sorterStateSchema } from '@/lib/schemas/sorter';
import initializeSorterState from '../utils/initializeSorterState';
import { AppResponseType } from '@/types/response';
import { RankingSubmissionData } from '@/types/data';
import { invalidateDraftCacheImmediate } from '@/lib/cacheInvalidation';

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
}: CreateSubmissionProps): Promise<AppResponseType<RankingSubmissionData>> {
	try {
		const { id: userId } = await requireSession();

		// 防禦性驗證: 確保 ALBUM 類型必須有 albumId
		if (type === "ALBUM" && !albumId) {
			return {
				type: "error",
				message: "Album sorter requires albumId",
			};
		}

		// Album Sorter 只有 1 個專輯，跳過 schema 驗證
		// Artist Sorter 需要至少 2 個專輯
		let validatedData = { selectedAlbumIds, selectedTrackIds };

		if (type === "ARTIST") {
			validatedData = sorterFilterSchema.parse({
				selectedAlbumIds,
				selectedTrackIds,
			});
		}

		// 獲取符合條件的歌曲
		const tracks = await getTracksByAlbumAndTrackIds({
			selectedAlbumIds: validatedData.selectedAlbumIds,
			selectedTrackIds: validatedData.selectedTrackIds,
		});

		if (tracks.length === 0) {
			return {
				type: "error",
				message: "沒有找到符合條件的歌曲",
			};
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

		if (existingSubmission) {
			// 更新現有的 submission
			const updatedSubmission = await db.rankingSubmission.update({
				where: { id: existingSubmission.id },
				data: {
					draftState: validatedDraftState,
					updatedAt: new Date(),
				},
			});
			return {
				data: updatedSubmission,
				type: "success",
				message: "Submission updated",
			};
		}

    // 創建新的 submission
    const newSubmission = await db.rankingSubmission.create({
      data: {
        userId,
        artistId,
        albumId: albumId || null,
        type: type as SubmissionType,
        status: SubmissionStatus.IN_PROGRESS,
        draftState: validatedDraftState,
      },
    });

    // ========== 快取失效（硬失效） ==========
    // 使用 invalidateDraftCacheImmediate 確保創建後立即看到新 submission
    await invalidateDraftCacheImmediate(userId, artistId);
    // ========== 快取失效結束 ==========

    return {
      data: newSubmission,
      type: 'success',
      message: 'Submission updated',
    };
  } catch (error) {
    console.error('createSubmission error:', error);
    return {
      type: 'error',
      message: 'Failed to create submission',
    };
  }
}
