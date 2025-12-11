/**
 * 快取標籤策略 - 粗粒度設計
 *
 * 設計原則:
 * - USER_DYNAMIC: 用戶的所有動態資料 (首頁、歷史、草稿、Hero、Discovery、已登記歌手)
 * - RANKING: 用戶+歌手的排名相關資料 (統計、提交記錄、歷史)
 * - ARTIST/ALBUM/TRACK: 靜態內容資料 (只在 admin 編輯時變動)
 */
export const CACHE_TAGS = {
  // ========== 動態資料層 ==========
  // 用戶的首頁、歷史、草稿、Hero 等頻繁變動的資料
  USER_DYNAMIC: (userId: string) => `user-dynamic-${userId}`,

  // 用戶+歌手的排名相關資料 (stats, submissions, history)
  RANKING: (userId: string, artistId: string) =>
    `ranking-${userId}-${artistId}`,

  // ========== 靜態內容層 ==========
  // 這些只在 admin 編輯時才會變
  ARTIST: (artistId: string) => `artist-${artistId}`,
  ALBUM: (albumId: string) => `album-${albumId}`,
  TRACK: (trackId: string) => `track-${trackId}`,
} as const;
