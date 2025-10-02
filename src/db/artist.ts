import { db } from "./client";

export async function getArtistById(artistId: string) {
	const artist = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});
	return artist;
}

export async function getLoggedArtists(userId: string) {
	const artists = await db.artist.findMany({
		where: {
			submissions: {
				some: {
					userId,
					status: "COMPLETED",
				},
			},
		},
		orderBy: {
			submissions: {
				_count: "desc",
			},
		},
	});

	return artists;
}

export async function getRecentLoggedArtists(userId: string) {
	// 先取得有完成記錄的歌手及其最新完成時間
	const artistsWithLatestSubmission = await db.artist.findMany({
		where: {
			submissions: {
				some: {
					userId,
					status: "COMPLETED",
				},
			},
		},
		include: {
			submissions: {
				where: {
					userId,
					status: "COMPLETED",
				},
				orderBy: {
					completedAt: "desc",
				},
				take: 1,
				select: {
					completedAt: true,
				},
			},
		},
	});

	// 根據最新完成時間排序
	const sortedArtists = artistsWithLatestSubmission
		.filter(artist => artist.submissions.length > 0)
		.sort((a, b) => {
			const aTime = a.submissions[0]?.completedAt;
			const bTime = b.submissions[0]?.completedAt;

			if (!aTime || !bTime) return 0;

			return bTime.getTime() - aTime.getTime();
		})
		.map(({ submissions: _, ...artist }) => artist);

	return sortedArtists;
}
