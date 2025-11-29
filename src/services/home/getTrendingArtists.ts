import { cache } from "react";
import { db } from "@/db/client";
import type { TrendingArtistType } from "@/types/home";
import { FEATURED_ARTIST_IDS } from "@/constants/featured";

export const getTrendingArtists = cache(
	async (): Promise<TrendingArtistType[]> => {
		// 🟢 從資料庫查詢固定 ID 的歌手
		const artists = await db.artist.findMany({
			where: { id: { in: FEATURED_ARTIST_IDS } },
			select: { id: true, name: true, img: true },
		});

		// 🟢 按照 FEATURED_ARTIST_IDS 的順序排列
		return FEATURED_ARTIST_IDS.map((id) => artists.find((a) => a.id === id))
			.filter((artist): artist is TrendingArtistType => artist !== undefined);
	},
);
