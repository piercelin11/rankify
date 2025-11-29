import { cache } from "react";
import { db } from "@/db/client";
import type { DashboardStatsType } from "@/types/home";

export const getUserDashboardStats = cache(
	async ({ userId }: { userId: string }): Promise<DashboardStatsType> => {
		// ✅ 並行查詢優化 (用 .then() 整合 topArtist 查詢)
		const [rankingCount, songCount, topArtist] = await Promise.all([
			// 1. 已完成排名次數
			db.rankingSubmission.count({
				where: { userId, status: "COMPLETED" },
			}),

			// 2. 評鑑單曲總數（累計人次）
			db.trackRanking.count({
				where: {
					userId,
					submission: { status: "COMPLETED" },
				},
			}),

			// 3. 本命歌手（互動場次最多）- 🟢 整合進 Promise.all
			db.rankingSubmission
				.groupBy({
					by: ["artistId"],
					where: { userId, status: "COMPLETED" },
					_count: { id: true },
					orderBy: { _count: { id: "desc" } },
					take: 1,
				})
				.then(async (data) => {
					if (data.length === 0) return null;
					return db.artist.findUnique({
						where: { id: data[0].artistId },
						select: { id: true, name: true, img: true },
					});
				}),
		]);

		return { rankingCount, songCount, topArtist };
	},
);
