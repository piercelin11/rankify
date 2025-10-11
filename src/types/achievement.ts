/**
 * 使用者在特定藝人的成就總覽型別
 * 用於 Achievement Overview 卡片
 */
export type UserArtistAchievementType = {
	artistModeCount: number; // Artist mode 完成次數
	albumModeCount: number; // Album mode 完成次數
	masteredAlbums: number; // 精通專輯數（所有歌曲都排過）
	totalAlbums: number; // 該藝人總專輯數
	totalSongInteractions: number; // 總歌曲互動次數（累加所有 submission 的歌曲數）
	masteryPercentage: number; // 精通百分比 = (masteredAlbums / totalAlbums) * 100
};
