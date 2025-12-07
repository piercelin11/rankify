import { cache } from "react";
import { db } from "@/db/client";
import type { DiscoveryArtistType } from "@/types/home";

export const getDiscoveryArtists = cache(
	async ({ userId }: { userId: string }): Promise<DiscoveryArtistType[]> => {
		// 取得使用者已互動的歌手 ID (包含草稿和完成記錄)
		const interactedArtistIds = await db.rankingSubmission
			.findMany({
				where: { userId },
				select: { artistId: true },
				distinct: ["artistId"],
			})
			.then((results) => results.map((r) => r.artistId));

		// 取得未排名的歌手 (使用 NOT IN)
		const discoveryArtists = await db.artist.findMany({
			where: {
				id: { notIn: interactedArtistIds },
			},
			select: {
				id: true,
				name: true,
				img: true,
			},
			// 目前歌手數量少,全部拿 (不限制數量)
			// 未來可加入: take: 15, orderBy: { name: 'asc' }
		});

		return discoveryArtists;
	}
);
