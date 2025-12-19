"use cache";

import { cacheLife } from "next/cache";
import { db } from "@/db/client";
import type { DiscoveryType } from "@/types/home";
import { CACHE_TIMES } from "@/constants/cache";

export async function getPopularAlbums(): Promise<DiscoveryType[]> {
	cacheLife(CACHE_TIMES.LONG);

	const popularAlbums = await db.album.findMany({
		select: {
			id: true,
			img: true,
			name: true,
		},
		orderBy: {
			submissions: {
				_count: "desc",
			},
		},
		take: 10,
	});

	return popularAlbums;
}
