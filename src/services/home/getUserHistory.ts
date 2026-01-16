'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/db/client';
import type { HistoryItemType } from '@/types/home';
import { CACHE_TIMES } from '@/constants/cache';
import { CACHE_TAGS } from '@/constants/cacheTags';

export async function getUserHistory({
  userId,
  limit = 15,
}: {
  userId: string;
  limit?: number;
}): Promise<HistoryItemType[]> {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.USER_DYNAMIC(userId));

  const history = await db.rankingSubmission.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: { not: null }, // 防禦性過濾
    },
    select: {
      id: true,
      type: true,
      completedAt: true,
      artistId: true,
      albumId: true,
      artist: {
        select: { id: true, name: true, img: true },
      },
      album: {
        select: { id: true, name: true, img: true },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });

  return history as HistoryItemType[];
}
