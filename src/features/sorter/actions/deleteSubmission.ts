'use server';

import { requireSession } from '@/../auth';
import { db } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { invalidateDraftCache } from '@/lib/cacheInvalidation';

export default async function deleteSubmission({
	submissionId,
}: {
	submissionId: string;
}) {
  try {
    const { id: userId } = await requireSession();

    // 先取得 artistId (刪除前)
    const submission = await db.rankingSubmission.findUnique({
      where: { id: submissionId, userId },
      select: { artistId: true },
    });

    await db.rankingSubmission.delete({
      where: {
        id: submissionId,
        userId,
      },
    });

    // ========== 快取失效 ==========
    if (submission) {
      await invalidateDraftCache(userId, submission.artistId);
      revalidatePath('/sorter');

    }
    // ========== 快取失效結束 ==========

    return { type: 'success', message: 'Draft is successfully deleted.' };
  } catch (error) {
    console.error('deleteSubmission error:', error);
    return { type: 'error', message: 'Failed to delete draft' };
  }
}
