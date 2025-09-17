import { AlbumData } from "@/types/data";
import { db } from "@/db/client";

export type AlbumHistoryType = Omit<AlbumData, "tracks"> & {
	dateId: string;
	date: Date;
	ranking: number;
	top25PercentCount: number;
	top50PercentCount: number;
	totalPoints: number;
	totalBasePoints: number;
	previousTotalPoints?: number;
	pointsChange?: number | null;
};

type getAlbumsRankingHistoryOptions = {
	includeChange?: boolean;
};

type getAlbumsRankingHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
	options?: getAlbumsRankingHistoryOptions;
};

const defaultOptions = {
	includeChange: false,
};

export async function getAlbumsRankingHistory({
	artistId,
	dateId,
	userId,
	options = defaultOptions,
}: getAlbumsRankingHistoryProps): Promise<AlbumHistoryType[]> {
	const albumRanking = await db.albumRanking.findMany({
		where: {
			artistId,
			dateId,
			userId,
		},
		include: {
			album: true,
			rankingSession: {
				select: {
					date: true,
				},
			},
		},
	});

	const top25PercentCount = await db.ranking.groupBy({
		by: ["albumId"],
		where: {
			artistId,
			albumId: {
				not: null,
			},
			dateId,
			userId,
			rankPercentile: { lte: 0.25 },
		},
		_count: {
			_all: true,
		},
	});
	const top25PercentMap = new Map(
		top25PercentCount.map((album) => [album.albumId, album._count._all])
	);

	const top50PercentCount = await db.ranking.groupBy({
		by: ["albumId"],
		where: {
			artistId,
			albumId: {
				not: null,
			},
			dateId,
			userId,
			rankPercentile: { lte: 0.5 },
		},
		_count: {
			_all: true,
		},
	});
	const top50PercentMap = new Map(
		top50PercentCount.map((album) => [album.albumId, album._count._all])
	);

	let prevPointsMap: Map<string, number> | undefined;

	if (options.includeChange) {
		const currentDate = albumRanking[0].rankingSession.date;

		const prevDateId = (
			await db.rankingSession.findFirst({
				where: {
					artistId,
					userId,
					date: {
						lt: currentDate,
					},
				},
				orderBy: {
					date: "desc",
				},
			})
		)?.id;

		if (prevDateId) {
			const prevAlbumRanking = await db.albumRanking.findMany({
				where: {
					artistId,
					dateId: prevDateId,
					userId,
				},
				select: {
					albumId: true,
					points: true,
				},
			});

			prevPointsMap = new Map(
				prevAlbumRanking.map((album) => [album.albumId, album.points])
			);
		}
	}

	const result = albumRanking.map((data) => {
		const prevPoints = options.includeChange
			? prevPointsMap?.get(data.albumId)
			: undefined;
		const pointsChange =
			options.includeChange && prevPoints != null
				? data.points - prevPoints
				: null;

		return {
			...data.album,
			dateId,
			date: data.rankingSession.date,
			ranking: data.ranking,
			top25PercentCount: top25PercentMap.get(data.albumId) ?? 0,
			top50PercentCount: top50PercentMap.get(data.albumId) ?? 0,
			totalPoints: data.points,
			totalBasePoints: data.basePoints,
			previousTotalPoints: prevPointsMap?.get(data.albumId),
			pointsChange: pointsChange,
		};
	});

	return result.sort((a, b) => b.totalPoints - a.totalPoints);
}
