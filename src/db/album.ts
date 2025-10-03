import { cache } from "react";
import { db } from "@/db/client";
import { DateRange } from "@/types/general";

export default async function getAlbumForAlbumPage(albumId: string) {
	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
		include: {
			artist: true,
		},
	});

	return album;
}

export const getLoggedAlbumNames = cache(async (
	artistId: string,
	userId: string,
	dateRange?: DateRange
) => {
	const dateFilter = dateRange
		? {
				createdAt: {
					...(dateRange.from && { gte: dateRange.from }),
					...(dateRange.to && { lte: dateRange.to }),
				},
				status: "COMPLETED" as const,
			}
		: { status: "COMPLETED" as const };

	const albums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					trackRanks: {
						some: {
							userId,
							submission: dateFilter,
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
});

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

	if (!album) return null;

	return {
		...album,
		rankings: album.albumRankings.map((r) => ({
			ranking: r.ranking,
			points: r.points,
			date: r.submission?.createdAt || new Date(),
			dateId: r.submission?.id || r.submissionId || "",
		})),
	};
}

export const getAlbumRankingSessions = cache(async (
	userId: string,
	artistId: string
) => {
	const albums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					trackRanks: {
						some: {
							userId,
							submission: {
								type: "ALBUM",
								status: "COMPLETED",
							},
						},
					},
				},
			},
		},
		include: {
			tracks: {
				include: {
					trackRanks: {
						where: {
							userId,
							submission: {
								type: "ALBUM",
								status: "COMPLETED",
							},
						},
						select: {
							submission: {
								select: {
									id: true,
								},
							},
						},
						distinct: ["submissionId"],
					},
				},
			},
		},
		orderBy: {
			releaseDate: "desc",
		},
	});

	return albums.map((album) => {
		// 收集所有 tracks 的 trackRanks
		const allTrackRanks = album.tracks.flatMap((track) => track.trackRanks);

		return {
			...album,
			sessionCount: allTrackRanks.length,
			trackRanks: allTrackRanks,
		};
	});
});

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

export async function getAlbumsByArtistId(artistId: string) {
	const albums = await db.album.findMany({
		where: {
			artistId,
		},
		include: {
			artist: true,
		},
		orderBy: {
			releaseDate: "desc",
		},
	});

	return albums;
}
