/**
 * Artist 頁面的有效視圖列表
 */
export const VALID_ARTIST_VIEWS = ['overview', 'all-rankings'] as const;

/**
 * Artist 頁面的視圖類型
 * - overview: 總覽儀表板（圖表、highlights）
 * - all-rankings: 完整的排名列表
 */
export type ArtistViewType = typeof VALID_ARTIST_VIEWS[number];

/**
 * Type Guard: 檢查字串是否為有效的 ArtistViewType
 */
export function isValidArtistView(view: string): view is ArtistViewType {
	return VALID_ARTIST_VIEWS.includes(view as ArtistViewType);
}

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
