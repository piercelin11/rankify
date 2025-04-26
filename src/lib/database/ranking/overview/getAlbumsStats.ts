import getTracksStats, { TimeFilterType } from "./getTracksStats";
import { AlbumData } from "@/types/data";
import getLoggedAlbum from "../../user/getLoggedAlbums";
import getRankingSession from "../../user/getRankingSession";
import {
	AlbumHistoryType,
	getAlbumsRankingHistory,
} from "../history/getAlbumsRankingHistory";
import { db } from "@/lib/prisma";
import getAlbumsByArtist from "../../data/getAlbumsByArtist";
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
	tracks: {
		name: string;
		id: string;
	}[];
	rankings?: {
		ranking: number;
		points: number;
		date: Date;
		dateId: string;
	}[];
};

type getAlbumsStatsOptions = {
	includeAllRankings: boolean;
};

type getAlbumsStatsProps = {
	artistId: string;
	userId: string;
	options?: getAlbumsStatsOptions;
	time?: TimeFilterType;
};

const defaultOptions = {
	includeAllRankings: false,
};

export async function getAlbumsStats({
	artistId,
	userId,
	options = defaultOptions,
	time,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> {
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;

	const albumData = await db.album.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
				},
			},
		},
		include: {
			tracks: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
	const albumDataMap = new Map(albumData.map((album) => [album.id, album]));

	const top5PercentCount = await db.ranking.groupBy({
		by: ["albumId"],
		where: {
			albumId: { not: null },
			artistId,
			userId,
			date: {
				date,
			},
			rankPercentile: {
				lte: 0.05,
			},
		},
		_count: {
			_all: true,
		},
	});
	const top5PercentMap = new Map(
		top5PercentCount.map((data) => [data.albumId, data._count._all])
	);

	const top10PercentCount = await db.ranking.groupBy({
		by: ["albumId"],
		where: {
			albumId: { not: null },
			artistId,
			userId,
			date: {
				date,
			},
			rankPercentile: {
				lte: 0.1,
			},
		},
		_count: {
			_all: true,
		},
	});
	const top10PercentMap = new Map(
		top10PercentCount.map((data) => [data.albumId, data._count._all])
	);

	const top25PercentCount = await db.ranking.groupBy({
		by: ["albumId"],
		where: {
			albumId: { not: null },
			artistId,
			userId,
			date: {
				date,
			},
			rankPercentile: {
				lte: 0.25,
			},
		},
		_count: {
			_all: true,
		},
	});
	const top25PercentMap = new Map(
		top25PercentCount.map((data) => [data.albumId, data._count._all])
	);

	const top50PercentCount = await db.ranking.groupBy({
		by: ["albumId"],
		where: {
			albumId: { not: null },
			artistId,
			userId,
			date: {
				date,
			},
			rankPercentile: {
				lte: 0.5,
			},
		},
		_count: {
			_all: true,
		},
	});
	const top50PercentMap = new Map(
		top50PercentCount.map((data) => [data.albumId, data._count._all])
	);

	const albumPoints = await db.albumRanking.groupBy({
		by: ["albumId"],
		where: {
			artistId,
			userId,
			date: {
				date,
			},
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

	let albumRankingsMap: AlbumRankingSeriesType | undefined;

	if (options.includeAllRankings && !time) {
		albumRankingsMap = await getAlbumRankingSeries({ artistId, userId });
	}

	const result = albumPoints.map((data, index) => ({
		...albumDataMap.get(data.albumId)!,
		ranking: index + 1,
		top5PercentCount: top5PercentMap.get(data.albumId) ?? 0,
		top10PercentCount: top10PercentMap.get(data.albumId) ?? 0,
		top25PercentCount: top25PercentMap.get(data.albumId) ?? 0,
		top50PercentCount: top50PercentMap.get(data.albumId) ?? 0,
		avgPoints: data._avg.points ? Math.round(data._avg.points) : 0,
		avgBasePoints: data._avg.basePoints ? Math.round(data._avg.basePoints) : 0,
		rankings: options.includeAllRankings
			? albumRankingsMap?.get(data.albumId)
			: undefined,
	}));

	return result;
}
