"use cache";

import { cacheLife } from "next/cache";
import { db } from "@/db/client";
import type { DiscoveryType } from "@/types/home";
import { CACHE_TIMES } from "@/constants/cache";

export async function getPopularArtists(): Promise<DiscoveryType[]> {
	cacheLife(CACHE_TIMES.LONG);

	const popularArtists = await db.artist.findMany({
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

	return popularArtists;
}
