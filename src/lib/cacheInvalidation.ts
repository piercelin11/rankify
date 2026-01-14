'use server';

import { revalidateTag, updateTag } from 'next/cache';
import { CACHE_TAGS } from '@/constants/cacheTags';

/**
 * 完成排名後的快取失效
 *
 * 影響範圍:
 * - USER_DYNAMIC: 首頁統計、歷史、Hero、Discovery、已登記歌手
 * - RANKING: 排名統計、提交記錄、排名歷史
 */
export async function invalidateRankingCache(userId: string, artistId: string) {
  revalidateTag(CACHE_TAGS.USER_DYNAMIC(userId), 'max');
  revalidateTag(CACHE_TAGS.RANKING(userId, artistId), 'max');
}

/**
 * 草稿操作後的快取失效（軟失效）
 *
 * 適用場景：非關鍵路徑（autoSave、列表更新）
 * 行為：下次請求先返回舊資料，背景更新
 *
 * 影響範圍:
 * - USER_DYNAMIC: 草稿清單、Hero 顯示
 * - RANKING: 未完成提交狀態
 */
export async function invalidateDraftCache(userId: string, artistId: string) {
  revalidateTag(CACHE_TAGS.USER_DYNAMIC(userId), 'max');
  revalidateTag(CACHE_TAGS.RANKING(userId, artistId), 'max');
}

/**
 * 草稿操作後的快取失效（硬失效）
 *
 * 適用場景：關鍵路徑（創建、刪除 submission）
 * 行為：下次請求必須等待新資料，確保即時一致性
 *
 * 影響範圍:
 * - USER_DYNAMIC: 草稿清單、Hero 顯示
 * - RANKING: 未完成提交狀態
 */
export async function invalidateDraftCacheImmediate(userId: string, artistId: string) {
  updateTag(CACHE_TAGS.USER_DYNAMIC(userId));
  updateTag(CACHE_TAGS.RANKING(userId, artistId));
}

/**
 * 管理端內容編輯後的快取失效
 *
 * 影響範圍:
 * - ARTIST/ALBUM/TRACK: 特定內容項目
 */
export async function invalidateAdminCache(
  type: 'artist' | 'album' | 'track',
  id: string
) {
  switch (type) {
    case 'artist':
      revalidateTag(CACHE_TAGS.ARTIST(id), 'max');
      break;
    case 'album':
      revalidateTag(CACHE_TAGS.ALBUM(id), 'max');
      break;
    case 'track':
      revalidateTag(CACHE_TAGS.TRACK(id), 'max');
      break;
  }
}
