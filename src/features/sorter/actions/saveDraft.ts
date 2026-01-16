'use server';

import { requireSession } from '@/../auth';
import { db } from '@/db/client';
import { sorterStateSchema, SorterStateType } from '@/lib/schemas/sorter';
import { invalidateDraftCache } from '@/lib/cacheInvalidation';

export default async function saveDraft(
	draftState: SorterStateType,
	submissionId: string
) {
	try {
		const { id: userId } = await requireSession();

		const existingSubmission = await db.rankingSubmission.findUnique({
			where: {
				id: submissionId,
				userId,
			},
		});

		if (!existingSubmission)
			return { type: "error", message: "Draft not found" };

    const validatedDraftState = sorterStateSchema.parse(draftState);
    await db.rankingSubmission.update({
      where: {
        id: existingSubmission.id,
      },
      data: {
        draftState: validatedDraftState,
        status: 'IN_PROGRESS',
      },
    });

    // ========== 快取失效 ==========
    await invalidateDraftCache(userId, existingSubmission.artistId);
    // ========== 快取失效結束 ==========

    return { type: 'success', message: 'Draft is successfully saved.' };
  } catch (error) {
    console.error('saveDraft error:', error);
    return { type: 'error', message: 'Failed to save draft' };
  }
}
