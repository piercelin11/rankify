/**
 * 快取時間策略
 *
 * LONG: 用於相對穩定的資料（統計、歷史、內容資料）
 * SHORT: 用於頻繁變動的資料（草稿、進行中的操作）
 */
export const CACHE_TIMES = {
  LONG: 'hours', // Next.js 預設 1 小時
  SHORT: 'minutes', // Next.js 預設 5-15 分鐘
} as const;
