import { db } from "@/db/client";
import { DateRange } from "@/types/general";

export default async function getAlbumForAlbumPage(albumId: string) {

	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
		include: {
			artist: true,
		}
	});

	return album;
}

export async function getLoggedAlbumNames(
    artistId: string,
    userId: string,
    dateRange?: DateRange,
) {
    const dateFilter = dateRange ? {
		date: {
			...(dateRange.from && { gte: dateRange.from }),
			...(dateRange.to && { lte: dateRange.to }),
		}
	} : undefined;

    const albums = await db.album.findMany({
        where: {
            artistId,
            tracks: {
                some: {
                    rankings: {
                        some: {
                            userId,
                            rankingSession: dateFilter,
                        },
                    },
                },
            },
        },
        select: {
            name: true,
        },
        orderBy: {
            releaseDate: "desc",
        },
    });

    return albums;
}

export async function getAlbumRanking(userId: string, albumId: string) {
	const album = await db.album.findUnique({
		where: {
			id: albumId,
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

	if (!album) return null;

	return {
		...album,
		rankings: album.albumRankings.map((r) => ({
			ranking: r.ranking,
			points: r.points,
			date: r.rankingSession.date,
			dateId: r.rankingSession.id,
		})),
	};
}

export async function getAlbumRankingSessions(
	userId: string,
	artistId: string,
) {

	const albums = await db.album.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
				},
			},
		},
		include: {
			rankings: {
				where: {
					userId,
					rankingSession: {
						type: "ALBUM",
					},
				},
				select: {
					rankingSession: {
						select: {
							id: true,
						},
					},
				},
			},
		},
		orderBy: {
			releaseDate: "desc",
		},
	});

	return albums.map((album) => ({
		...album,
		sessionCount: album.rankings.length,
	}));
}

export async function getAlbumComparisonOptions(
	userId: string,
	artistId: string
) {
	// 獲取該藝人的所有專輯（有排名資料的）
	const albums = await db.album.findMany({
		where: {
			artistId,
			albumRankings: {
				some: { userId },
			},
		},
		select: {
			id: true,
			name: true,
			color: true,
		},
		orderBy: { releaseDate: "asc" },
	});

	return {
		parentOptions: [], // Album 頁面不需要 parent
		menuOptions: albums.map((album) => ({
			id: album.id,
			name: album.name || "Unknown Album",
			color: album.color,
			parentId: null,
		})),
	};
}
