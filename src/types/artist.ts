/**
 * Artist 頁面的視圖類型
 * - overview: 總覽儀表板（圖表、highlights）
 * - all-rankings: 完整的排名列表
 */
export type ArtistViewType = 'overview' | 'all-rankings';

/**
 * Artist 頁面的資料來源模式
 * - average: 所有歷史排名的平均值
 * - snapshot: 某次具體的排名快照
 */
export type ArtistDataSourceMode = 'average' | 'snapshot';

/**
 * Artist 排名快照的 Session 資訊
 */
export type ArtistRankingSession = {
  id: string;
  createdAt: Date;
};
