import z from "zod/v4";

/**
 * Artist 頁面的視圖類型 Schema
 * - overview: 總覽儀表板（圖表、highlights）
 * - all-rankings: 完整的排名列表
 */
export const artistViewParamsSchema = z
	.enum(["overview", "all-rankings"])
	.default("overview");

/**
 * Artist 頁面的時間範圍 Schema
 */
export const artistRangeParamsSchema = z
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
export type ArtistViewType = z.infer<typeof artistViewParamsSchema>;
export type ArtistRangeType = z.infer<typeof artistRangeParamsSchema>;
