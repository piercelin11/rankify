"use cache";

import { cacheLife } from "next/cache";
import { db } from "@/db/client";
import { CACHE_TIMES } from "@/constants/cache";

export type CommunityPickType = {
	id: string;
	title: string;
	submissionId: string;
	albumId: string;
	albumName: string;
	albumImg: string | null;
	artistId: string;
	artistName: string;
	userName: string | null;
	userImage: string | null;
	completedAt: Date;
};

export async function getCommunityPicks(): Promise<CommunityPickType[]> {
	cacheLife(CACHE_TIMES.SHORT);

	const recentSubmissions = await db.rankingSubmission.findMany({
		where: {
			status: "COMPLETED",
			completedAt: {
				gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
				not: null,
			},
		},
		include: {
			user: { select: { id: true, name: true, image: true } },
			album: { select: { id: true, name: true, img: true } },
			artist: { select: { id: true, name: true } },
		},
		orderBy: { completedAt: "desc" },
		take: 5,
	});

	return recentSubmissions.map((s) => ({
		id: s.id,
		title: `${s.user.name}'s top ${s.artist.name}/${s.album?.name ?? "Unknown"} tracks`,
		submissionId: s.id,
		albumId: s.albumId ?? "",
		albumName: s.album?.name ?? "Unknown",
		albumImg: s.album?.img ?? null,
		artistId: s.artistId,
		artistName: s.artist.name,
		userName: s.user.name,
		userImage: s.user.image,
		completedAt: s.completedAt!,
	}));
}
