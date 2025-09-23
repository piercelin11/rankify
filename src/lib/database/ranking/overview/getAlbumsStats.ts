import { DateRange } from "./getTracksStats";
import { AlbumData } from "@/types/data";
import { db } from "@/db/client";
import getAlbumRankingSeries, {
	AlbumRankingSeriesType,
} from "./getAlbumRankingSeries";

export type AlbumStatsType = Omit<AlbumData, "tracks"> & {
	ranking: number;
	top5PercentCount: number;
	top10PercentCount: number;
	top25PercentCount: number;
	top50PercentCount: number;
	avgPoints: number;
	avgBasePoints: number;
	rankings?: {
		ranking: number;
		points: number;
		createdAt: Date;
		submissionId: string;
	}[];
};

type getAlbumsStatsOptions = {
	includeAllRankings?: boolean;
};

type getAlbumsStatsProps = {
	artistId: string;
	userId: string;
	options?: getAlbumsStatsOptions;
	dateRange?: DateRange;
};

const defaultOptions = {
	includeAllRankings: false,
};

type AlbumQueryConditions = {
	artistId: string;
	userId: string;
	submission?: {
		createdAt?: {
			gte?: Date;
			lte?: Date;
		};
		status?: string;
	};
};

async function getAlbumPercentileCounts(
	albumIds: string[],
	conditions: AlbumQueryConditions
) {
	const results = await db.trackRanking.findMany({
		where: {
			...conditions,
			track: {
				albumId: { in: albumIds },
			},
			submission: { status: "COMPLETED" },
		},
		select: {
			track: {
				select: {
					albumId: true,
				},
			},
			rankPercentile: true,
		},
	});

	return albumIds.reduce((acc, albumId) => {
		const albumRankings = results.filter(r => r.track.albumId === albumId);
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
	options = defaultOptions,
	dateRange,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> {
	const dateFilter = dateRange ? {
		createdAt: {
			...(dateRange.from && { gte: dateRange.from }),
			...(dateRange.to && { lte: dateRange.to }),
		},
		status: "COMPLETED" as const
	} : { status: "COMPLETED" as const };

	const albumData = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					trackRanks: {
						some: {
							userId,
						},
					},
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
			submission: dateFilter,
		},
		_avg: {
			points: true,
			basePoints: true,
		},
		orderBy: {
			_avg: {
				points: "desc",
			},
		},
	});

	const albumIds = albumPoints.map(data => data.albumId);

	const conditions: AlbumQueryConditions = {
		artistId,
		userId,
		submission: dateFilter,
	};

	const percentileCounts = await getAlbumPercentileCounts(albumIds, conditions);

	let albumRankingsMap: AlbumRankingSeriesType | undefined;
	if (options.includeAllRankings && !dateRange) {
		albumRankingsMap = await getAlbumRankingSeries({ artistId, userId });
	}

	const result = albumPoints.map((data, index) => {
		const album = albumDataMap.get(data.albumId)!;
		const counts = percentileCounts[data.albumId] || { top5: 0, top10: 0, top25: 0, top50: 0 };

		return {
			...album,
			ranking: index + 1,
			top5PercentCount: counts.top5,
			top10PercentCount: counts.top10,
			top25PercentCount: counts.top25,
			top50PercentCount: counts.top50,
			avgPoints: data._avg.points ? Math.round(data._avg.points) : 0,
			avgBasePoints: data._avg.basePoints ? Math.round(data._avg.basePoints) : 0,
			rankings: options.includeAllRankings
				? albumRankingsMap?.get(data.albumId)
				: undefined,
		};
	});

	return result;
}
