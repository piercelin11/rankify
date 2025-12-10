"use cache";

import { cacheLife } from "next/cache";
import { db } from "@/db/client";
import type { DashboardStatsType } from "@/types/home";

export async function getUserDashboardStats({
	userId,
}: {
	userId: string;
}): Promise<DashboardStatsType> {
	cacheLife("hours");

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

		// 3. 本命歌手（互動場次最多）
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
}
