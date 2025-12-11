'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/db/client';
import type { HeroItemType } from '@/types/home';
import { CACHE_TIMES } from '@/constants/cache';
import { CACHE_TAGS } from '@/constants/cacheTags';

export async function getHeroItem({
  userId,
}: {
  userId: string;
}): Promise<HeroItemType | null> {
  cacheLife(CACHE_TIMES.SHORT);
  cacheTag(CACHE_TAGS.USER_DYNAMIC(userId));
  // P1: 24h 內有新戰績 (Achievement)
  const recentAchievement = await db.rankingSubmission.findFirst({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h 前
        not: null,
      },
    },
    include: {
      artist: {
        select: { id: true, name: true, img: true },
      },
      album: {
        select: { id: true, name: true, img: true },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 1,
  });

  if (recentAchievement) {
    const displayName =
      recentAchievement.type === 'ARTIST'
        ? recentAchievement.artist.name
        : recentAchievement.album?.name || 'Unknown';
    const displayImg =
      recentAchievement.type === 'ARTIST'
        ? recentAchievement.artist.img
        : recentAchievement.album?.img || null;

    return {
      type: 'achievement',
      data: {
        id: recentAchievement.id,
        name: displayName,
        img: displayImg,
        submissionId: recentAchievement.id,
        completedAt: recentAchievement.completedAt!,
        artistId: recentAchievement.artistId,
        type: recentAchievement.type, // 用於判斷路由
      },
    };
  }

  // P2: 有未完成草稿 (Resume)
  const draft = await db.rankingSubmission.findFirst({
    where: {
      userId,
      status: { in: ['IN_PROGRESS', 'DRAFT'] },
    },
    include: {
      artist: {
        select: { id: true, name: true, img: true },
      },
      album: {
        select: { id: true, name: true, img: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 1,
  });

  if (draft && draft.draftState && typeof draft.draftState === 'object') {
    const displayName =
      draft.type === 'ARTIST'
        ? draft.artist.name
        : draft.album?.name || 'Unknown';
    const displayImg =
      draft.type === 'ARTIST' ? draft.artist.img : draft.album?.img || null;
    const draftState = draft.draftState as { percent?: number };
    const progress = draftState.percent || 0;

    return {
      type: 'resume',
      data: {
        id: draft.type === 'ARTIST' ? draft.artistId : draft.albumId!,
        name: displayName,
        img: displayImg,
        submissionId: draft.id,
        progress,
        type: draft.type, // 用於判斷路由
      },
    };
  }

  // P3: 顯示 Top Artist (本命歌手)
  const topArtistData = await db.rankingSubmission.groupBy({
    by: ['artistId'],
    where: { userId, status: 'COMPLETED' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 1,
  });

  if (topArtistData.length > 0) {
    const artist = await db.artist.findUnique({
      where: { id: topArtistData[0].artistId },
      select: { id: true, name: true, img: true },
    });

    if (artist) {
      return {
        type: 'top_artist',
        data: {
          id: artist.id,
          name: artist.name,
          img: artist.img,
          artistId: artist.id,
        },
      };
    }
  }

  // P3 備用: 顯示 Discovery (隨機未排名歌手)
  // 復用 getDiscoveryArtists,減少重複程式碼
  const { getDiscoveryArtists } = await import('./getDiscoveryArtists');
  const discoveryArtists = await getDiscoveryArtists({ userId });

  if (discoveryArtists.length > 0) {
    // 簡易版: 取第一筆 (未來可改用隨機)
    const discoveryArtist = discoveryArtists[0];

    return {
      type: 'discovery',
      data: {
        id: discoveryArtist.id,
        name: discoveryArtist.name,
        img: discoveryArtist.img,
        artistId: discoveryArtist.id,
      },
    };
  }

  // 若完全沒資料,返回 null
  return null;
}
