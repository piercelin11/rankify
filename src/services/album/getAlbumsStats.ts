import { db } from "@/db/client";
import { DateRange } from "@/types/general";
import { AlbumStatsType } from "./types";
import { Prisma } from "@prisma/client";

type getAlbumsStatsProps = {
	artistId: string;
	userId: string;
	dateRange?: DateRange;
};


async function getAlbumPercentileCounts(
	albumIds: string[],
	conditions: Prisma.RankingWhereInput
) {
	const results = await db.ranking.findMany({
		where: {
			...conditions,
			albumId: { in: albumIds },
		},
		select: {
			albumId: true,
			rankPercentile: true,
		},
	});

	return albumIds.reduce((acc, albumId) => {
		const albumRankings = results.filter(r => r.albumId === albumId);
		acc[albumId] = {
			top5: albumRankings.filter(r => r.rankPercentile <= 0.05).length,
			top10: albumRankings.filter(r => r.rankPercentile <= 0.1).length,
			top25: albumRankings.filter(r => r.rankPercentile <= 0.25).length,
			top50: albumRankings.filter(r => r.rankPercentile <= 0.5).length,
		};
		return acc;
	}, {} as Record<string, { top5: number; top10: number; top25: number; top50: number }>);
}
 
export default async function getAlbumsStats({
	artistId,
	userId,
	dateRange,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> {
	const dateFilter = dateRange ? {
		date: {
			...(dateRange.from && { gte: dateRange.from }),
			...(dateRange.to && { lte: dateRange.to }),
		}
	} : undefined;

	const albumData = await db.album.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
				},
			},
		}
	});
	const albumDataMap = new Map(albumData.map((album) => [album.id, album]));

	const albumPoints = await db.albumRanking.groupBy({
		by: ["albumId"],
		where: {
			artistId,
			userId,
			rankingSession: dateFilter,
		},
		_avg: {
			points: true,
			basePoints: true,
			ranking: true,
		},
		_count: {
			ranking: true,
		},
		orderBy: {
			_avg: {
				points: "desc",
			},
		},
	});

	const albumIds = albumPoints.map(data => data.albumId);

	const conditions: Prisma.RankingWhereInput = {
		albumId: { not: null },
		artistId,
		userId,
		rankingSession: dateFilter,
	};

	const percentileCounts = await getAlbumPercentileCounts(albumIds, conditions);

	const result = albumPoints.map((data, index) => {
		const album = albumDataMap.get(data.albumId)!;
		const counts = percentileCounts[data.albumId] || { top5: 0, top10: 0, top25: 0, top50: 0 };

		return {
			...album,
			ranking: index + 1,
			averageRanking: data._avg.ranking ? data._avg.ranking.toFixed(1) : 0,
			top5PercentCount: counts.top5,
			top10PercentCount: counts.top10,
			top25PercentCount: counts.top25,
			top50PercentCount: counts.top50,
			avgPoints: data._avg.points ? Math.round(data._avg.points) : 0,
			avgBasePoints: data._avg.basePoints ? Math.round(data._avg.basePoints) : 0,
			sessionCount: data._count.ranking,
		};
	});

	return result;
}
