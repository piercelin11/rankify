import { db } from "@/db/client";

export async function getTrackForTrackPage(trackId: string) {
	const track = await db.track.findFirst({
		where: {
			id: trackId,
		},
		include: {
			artist: true,
			album: true,
		},
	});

	return track;
}

export async function getTracksRankings(userId: string, trackIds: string[]) {
	const tracks = await db.track.findMany({
		where: {
			id: {
				in: trackIds,
			},
			trackRanks: {
				some: {
					userId,
				},
			},
		},
		include: {
			trackRanks: {
				where: {
					userId,
				},
				include: {
					submission: true,
				},
				orderBy: {
					submission: {
						createdAt: "asc",
					},
				},
			},
		},
	});

	return tracks.map((track) => ({
		...track,
		rankings: track.trackRanks.map((r) => ({
			ranking: r.rank,
			rankPercentile: r.rankPercentile,
			rankChange: r.rankChange,
			date: r.submission.createdAt,
			dateId: r.submission.id,
		})),
	}));
}

export async function getTrackRanking(userId: string, trackId: string) {
	const track = await db.track.findUnique({
		where: {
			id: trackId,
		},
		include: {
			trackRanks: {
				where: {
					userId,
				},
				include: {
					submission: true,
				},
				orderBy: {
					submission: {
						createdAt: "asc",
					},
				},
			},
		},
	});

	if (!track) return null;

	return {
		...track,
		rankings: track.trackRanks.map((r) => ({
			ranking: r.rank,
			rankPercentile: r.rankPercentile,
			rankChange: r.rankChange,
			date: r.submission.createdAt,
			dateId: r.submission.id,
		})),
	};
}

/**
 * 獲取歌曲比較選項，用於歌曲排名線圖下拉選單
 * @param userId
 * @param artistId
 * @returns
 */
export async function getTrackComparisonOptions(
	userId: string,
	artistId: string
) {
	// 獲取該藝人的所有專輯（有排名資料的）
	const albums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					trackRanks: {
						some: { userId },
					},
				},
			},
		},
		select: {
			id: true,
			name: true,
			color: true,
		},
		orderBy: { releaseDate: "asc" },
	});

	// 獲取該藝人的所有歌曲（有排名資料的）
	const tracks = await db.track.findMany({
		where: {
			artistId,
			trackRanks: {
				some: { userId },
			},
		},
		select: {
			id: true,
			name: true,
			color: true,
			albumId: true,
		},
		orderBy: [{ album: { releaseDate: "asc" } }, { trackNumber: "asc" }],
	});

	return {
		parentOptions: albums.map((album) => ({
			id: album.id,
			name: album.name || "Unknown Album",
			color: album.color,
		})),
		menuOptions: tracks.map((track) => ({
			id: track.id,
			name: track.name,
			color: track.color,
			parentId: track.albumId,
		})),
	};
}
