import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";

/**
 * Track 基礎指標型別
 * 用於計算排名的中間數據
 */
export type TrackMetrics = {
	id: string;
	ranking: number;
	peak: number;
	worst: number;
	count: number;
	averageRanking: number;
};

/**
 * Track 統計資料型別
 * 用於 My Stats 的 Overview 和 All Rankings 視圖
 *
 * 資料來源：
 * - Track Model: id, name, artistId, albumId, img, color, trackNumber, discNumber, type, releaseDate, spotifyUrl
 * - TrackStat Model: overallRank, highestRank, lowestRank, cumulativeRankChange, submissionCount, hotStreak, coldStreak, overallRankChange
 * - 計算欄位: rank, gap, top50PercentCount, top25PercentCount, top5PercentCount
 * - 關聯資料: album (name, color)
 */
export type TrackStatsType = {
	// === Track Model 欄位 ===
	id: string;
	name: string;
	artistId: string;
	albumId: string | null;
	img: string | null;
	color: string | null;
	trackNumber: number | null;
	discNumber: number | null;
	type: string;
	releaseDate: Date | null;
	spotifyUrl: string;

	// === TrackStat Model 欄位 ===
	overallRank: number;
	highestRank: number;
	lowestRank: number;
	averageRank: number;
	cumulativeRankChange: number;
	submissionCount: number;
	hotStreak: number;
	coldStreak: number;
	overallRankChange: number | null;

	// === 計算欄位 ===
	rank: number;
	gap: number | null;
	top50PercentCount: number;
	top25PercentCount: number;
	top5PercentCount: number;

	// === 關聯資料 ===
	album: {
		name: string | null;
		color: string | null;
	};
};

/**
 * Track 歷史記錄型別
 * 用於 My Stats 的 Snapshot 視圖
 *
 * 資料來源：
 * - Track Model: id, name, artistId, albumId, img, color, trackNumber, discNumber, type, releaseDate, spotifyUrl
 * - TrackRanking Model: rank, rankPercentile, rankChange
 * - RankingSubmission: createdAt
 * - 計算欄位: peak, achievement
 * - 關聯資料: album (name, color)
 */
export type TrackHistoryType = {
	// === Track Model 欄位 ===
	id: string;
	name: string;
	artistId: string;
	albumId: string | null;
	img: string | null;
	color: string | null;
	trackNumber: number | null;
	discNumber: number | null;
	type: string;
	releaseDate: Date | null;
	spotifyUrl: string;

	// === TrackRanking Model 欄位 ===
	rank: number;
	rankPercentile: number;
	rankChange: number | null;

	// === RankingSubmission 欄位 ===
	date: Date;
	submissionId: string;
	createdAt: Date;

	// === 計算欄位 ===
	peak: number;
	achievement: AchievementType[];

	// === 關聯資料 ===
	album: {
		name: string;
		color: string | null;
	} | null;
};
