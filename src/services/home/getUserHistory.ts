import { cache } from "react";
import { db } from "@/db/client";
import type { HistoryItemType } from "@/types/home";

export const getUserHistory = cache(
	async ({
		userId,
		limit = 15,
	}: {
		userId: string;
		limit?: number;
	}): Promise<HistoryItemType[]> => {
		const history = await db.rankingSubmission.findMany({
			where: {
				userId,
				status: "COMPLETED",
				completedAt: { not: null }, // 🟢 防禦性過濾
			},
			select: {
				id: true,
				type: true,
				completedAt: true,
				artistId: true,
				albumId: true,
				artist: {
					select: { id: true, name: true, img: true },
				},
				album: {
					select: { id: true, name: true, img: true },
				},
			},
			orderBy: { completedAt: "desc" },
			take: limit,
		});

		return history as HistoryItemType[];
	},
);
