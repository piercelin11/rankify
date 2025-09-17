"use server";

import { db } from "@/db/client";
import { getUserSession } from "@/../auth";

export async function getComparisonAlbumsData(albumIds: string[]) {
	const { id: userId } = await getUserSession();

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
						rankingSession: true,
					},
					orderBy: {
						rankingSession: {
							date: "asc",
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
			rankings: album.albumRankings.map((r) => ({
				ranking: r.ranking,
				points: r.points,
				date: r.rankingSession.date,
				dateId: r.rankingSession.id,
			})),
		}));
	} catch (error) {
		console.error("Failed to fetch comparison albums:", error);
		return [];
	}
}