"use server";

import { db } from "@/db/client";
import { requireSession } from "@/../auth";

export async function getComparisonAlbumsData(albumIds: string[]) {
	const { id: userId } = await requireSession();

	if (!userId || albumIds.length === 0) {
		return [];
	}

	try {
		const albums = await db.album.findMany({
			where: {
				id: {
					in: albumIds,
				},
				albumRankings: {
					some: {
						userId,
					},
				},
			},
			include: {
				albumRankings: {
					where: {
						userId,
					},
					include: {
						submission: true,
					},
					orderBy: {
						submission: {
							completedAt: "asc",
						},
					},
				},
			},
		});

		return albums.map((album) => ({
			type: 'album' as const,
			id: album.id,
			name: album.name || "Unknown Album",
			color: album.color,
			rankings: album.albumRankings
				.filter((r) => r.submission.completedAt !== null)
				.map((r) => ({
					rank: r.rank,
					points: r.points,
					date: r.submission.completedAt!,
					dateId: r.submission.id,
				})),
		}));
	} catch (error) {
		console.error("Failed to fetch comparison albums:", error);
		return [];
	}
}