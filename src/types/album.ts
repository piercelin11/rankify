/**
 * Album 統計資料型別
 * 用於 My Stats 的 Overview 視圖和圖表
 *
 * 資料來源：
 * - Album Model: id, name, artistId, spotifyUrl, color, img, releaseDate, type
 * - AlbumRanking (aggregated): averageRank, avgPoints, avgBasePoints, submissionCount
 * - 計算欄位: rank, top5PercentCount, top10PercentCount, top25PercentCount, top50PercentCount
 */
export type AlbumStatsType = {
	// === Album Model 欄位 ===
	id: string;
	name: string;
	artistId: string;
	spotifyUrl: string;
	color: string | null;
	img: string | null;
	releaseDate: Date;
	type: string;

	// === AlbumRanking 聚合欄位 ===
	averageRank: number | string;
	avgPoints: number;
	avgBasePoints: number;
	submissionCount: number;

	// === 計算欄位 ===
	rank: number;
	top5PercentCount: number;
	top10PercentCount: number;
	top25PercentCount: number;
	top50PercentCount: number;
};

/**
 * Album 歷史記錄型別
 * 用於 My Stats 的 Snapshot 視圖
 *
 * 資料來源：
 * - Album Model: id, name, artistId, spotifyUrl, color, img, releaseDate, type
 * - AlbumRanking: rank, totalPoints, totalBasePoints
 * - RankingSubmission: createdAt
 * - 計算欄位: top25PercentCount, top50PercentCount, previousTotalPoints, pointsChange
 */
export type AlbumHistoryType = {
	// === Album Model 欄位 ===
	id: string;
	name: string;
	artistId: string;
	spotifyUrl: string;
	color: string | null;
	img: string | null;
	releaseDate: Date;
	type: string;

	// === AlbumRanking 欄位 ===
	rank: number;
	totalPoints: number;
	totalBasePoints: number;

	// === RankingSubmission 欄位 ===
	submissionId: string;
	createdAt: Date;

	// === 計算欄位 ===
	top25PercentCount: number;
	top50PercentCount: number;
	previousTotalPoints?: number;
	pointsChange?: number | null;
};
