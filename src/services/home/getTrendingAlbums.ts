"use cache";

import { cacheLife } from "next/cache";
import { db } from "@/db/client";
import type { DiscoveryType } from "@/types/home";
import { CACHE_TIMES } from "@/constants/cache";

export async function getTrendingAlbums(): Promise<DiscoveryType[]> {
	cacheLife(CACHE_TIMES.LONG);

	const trendingAlbums = await db.album.findMany({
		where: {
			submissions: {
				some: {
					status: "COMPLETED",
					completedAt: {
						gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
						not: null,
					},
				},
			},
		},
		select: {
			id: true,
			img: true,
			name: true,
			_count: {
				select: {
					submissions: {
						where: {
							status: "COMPLETED",
							completedAt: {
								gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
								not: null,
							},
						},
					},
				},
			},
		},
		orderBy: {
			submissions: {
				_count: "desc",
			},
		},
		take: 20,
	});

	return trendingAlbums.map((album) => ({
		id: album.id,
		img: album.img,
		name: album.name,
	}));
}
