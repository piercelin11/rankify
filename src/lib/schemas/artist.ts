import z from "zod";

/**
 * Artist 頁面的視圖類型 Schema
 * - overview: 總覽儀表板（圖表、highlights）
 * - all-rankings: 完整的排名列表
 */
export const ArtistViewParamsSchema = z
	.enum(["overview", "all-rankings"])
	.default("overview");

/**
 * Artist 頁面的時間範圍 Schema
 */
export const ArtistRangeParamsSchema = z
	.enum([
		"past-month",
		"past-6-months",
		"past-year",
		"past-2-years",
		"all-time",
	])
	.default("all-time");

/**
 * 從 Schema 推導出的 TypeScript 類型
 */
export type ArtistViewType = z.infer<typeof ArtistViewParamsSchema>;
export type ArtistRangeType = z.infer<typeof ArtistRangeParamsSchema>;
