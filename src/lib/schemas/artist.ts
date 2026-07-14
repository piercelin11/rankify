import z from "zod/v4";

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
export type ArtistRangeType = z.infer<typeof artistRangeParamsSchema>;
