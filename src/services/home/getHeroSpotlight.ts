"use cache";

import { cacheLife } from "next/cache";
import { db } from "@/db/client";
import { CACHE_TIMES } from "@/constants/cache";

export type HeroSpotlightType = {
	id: string;
	name: string;
	img: string | null;
	artistId: string;
	artistName: string;
	submissionCount: number;
};

export async function getHeroSpotlight(): Promise<HeroSpotlightType | null> {
	cacheLife(CACHE_TIMES.LONG);

	// 選擇最近 30 天內最熱門的專輯
	const popularAlbum = await db.album.findFirst({
		where: {
			submissions: {
				some: {
					status: "COMPLETED",
					completedAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
						not: null,
					},
				},
			},
		},
		select: {
			id: true,
			name: true,
			img: true,
			artistId: true,
			artist: {
				select: {
					name: true,
				},
			},
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
	});

	if (!popularAlbum) {
		return null;
	}

	return {
		id: popularAlbum.id,
		name: popularAlbum.name,
		img: popularAlbum.img,
		artistId: popularAlbum.artistId,
		artistName: popularAlbum.artist.name,
		submissionCount: popularAlbum._count.submissions,
	};
}
