import { cache } from "react";
import { db } from "@/db/client";
import { DateRange } from "@/types/general";

export async function getAlbumById({ albumId }: { albumId: string }) {
	const album = await db.album.findFirst({
		where: {
			id: albumId,
		},
	});

	return album;
}

export async function getAlbumForAlbumPage({ albumId }: { albumId: string }) {
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

export const getLoggedAlbumNames = cache(
	async ({
		artistId,
		userId,
		dateRange,
	}: {
		artistId: string;
		userId: string;
		dateRange?: DateRange;
	}) => {
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
	}
);

export async function getAlbumRanking({
	userId,
	albumId,
}: {
	userId: string;
	albumId: string;
}) {
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

export const getAlbumRankingSessions = cache(
	async ({ userId, artistId }: { userId: string; artistId: string }) => {
		const albums = await db.album.findMany({
			where: {
				artistId,
			},
			include: {
				submissions: {
					where: {
						userId,
						status: "COMPLETED",
						type: "ALBUM",
					}
				}
			},
			orderBy: {
				releaseDate: "desc",
			},
		});

		return albums.map((album) => {
			return {
				...album,
				sessionCount: album.submissions.length,
			};
		});
	}
);

export async function getAlbumComparisonOptions({
	userId,
	artistId,
}: {
	userId: string;
	artistId: string;
}) {
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

export async function getAlbumsByArtistId({ artistId }: { artistId: string }) {
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
