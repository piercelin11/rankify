import { db } from "@/lib/prisma";
import { TrackData } from "@/types/data";
import getTracksMetrics from "./getTracksMetrics";
import { getUserRankingPreference } from "../../user/getUserPreference";
import getLatestRankingSession from "../../user/getLatestRankingSession";
import getTrackRankingSeries, {
	TrackRankingSeriesType,
} from "./getTrackRankingSeries";

export type TrackStatsType = Omit<TrackData, "artist" | "album"> & {
	ranking: number;
	averageRanking: number | string;
	peak: number;
	worst: number;
	gap: number | null;
	album: {
		name: string | null;
		color: string | null;
	};
	top50PercentCount: number;
	top25PercentCount: number;
	top5PercentCount: number;
	rankings?: { ranking: number; date: Date; dateId: string }[];
	rankChange?: number | null;
};

export type TimeFilterType = {
	threshold?: Date;
	filter: "gte" | "lte" | "gt" | "lt" | "equals";
};

export type getTracksStatsProps = {
	artistId: string;
	userId: string;
	options?: getTracksStatsOptions;
	take?: number;
	time?: TimeFilterType;
};

type getTracksStatsOptions = {
	includeRankChange: boolean;
	includeAllRankings: boolean;
};

const defaultOptions = {
	includeRankChange: false,
	includeAllRankings: false,
};

export default async function getTracksStats({
	artistId,
	userId,
	options = defaultOptions,
	take,
	time,
}: getTracksStatsProps): Promise<TrackStatsType[]> {
	const trackConditions = await getUserRankingPreference({ userId });
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;

	const trackMetrics = await getTracksMetrics({ artistId, userId, take, time });
	const trackIds = trackMetrics.map((track) => track.id);

	const top50PercentCounts = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			artistId,
			date: { date },
			rankPercentile: { lte: 0.5 },
			trackId: { in: trackIds },
			track: trackConditions,
		},
		_count: { _all: true },
	});
	const top50PercentMap = new Map(
		top50PercentCounts.map((track) => [track.trackId, track._count._all])
	);

	const top25PercentCounts = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			artistId,
			date: { date },
			rankPercentile: { lte: 0.25 },
			trackId: { in: trackIds },
			track: trackConditions,
		},
		_count: { _all: true },
	});
	const top25PercentMap = new Map(
		top25PercentCounts.map((track) => [track.trackId, track._count._all])
	);

	const top5PercentCounts = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			artistId,
			date: { date },
			rankPercentile: { lte: 0.05 },
			trackId: { in: trackIds },
			track: trackConditions,
		},
		_count: { _all: true },
	});
	const top5PercentMap = new Map(
		top5PercentCounts.map((track) => [track.trackId, track._count._all])
	);

	const allTracks = await db.track.findMany({
		where: {
			id: {
				in: trackIds,
			},
			artistId,
			rankings: {
				some: {
					userId,
				},
			},
		},
		include: {
			album: {
				select: {
					name: true,
					color: true,
				},
			},
		},
	});
	const allTracksMap = new Map(allTracks.map((track) => [track.id, track]));

	//依據 options 判斷是否獲取前次紀錄以及所以排名
	let prevTrackRankingMap: Map<string, number> | undefined;
	if (options.includeRankChange && !time) {
		const latestSession = await getLatestRankingSession({ userId, artistId });
		const prevTrackRanking = await db.ranking.groupBy({
			by: ["trackId"],
			where: {
				userId,
				artistId,
				date: {
					date: {
						lt: latestSession?.date,
					},
				},
			},
			orderBy: [
				{
					_avg: {
						ranking: "asc",
					},
				},
				{
					_min: {
						ranking: "asc",
					},
				},
				{
					_max: {
						ranking: "asc",
					},
				},
				{
					trackId: "desc",
				},
			],
		});
		prevTrackRankingMap = new Map(
			prevTrackRanking.map((track, index) => [track.trackId, index + 1])
		);
	}

	let trackRankingsMap: TrackRankingSeriesType | undefined;

	if (options.includeAllRankings && !time) {
		trackRankingsMap = await getTrackRankingSeries({ artistId, userId });
	}

	const result = trackMetrics.map((data) => ({
		...allTracksMap.get(data.id)!,
		album: {
			name: allTracksMap.get(data.id)?.album?.name ?? null,
			color: allTracksMap.get(data.id)?.album?.color ?? null,
		},
		ranking: data.ranking,
		averageRanking: data.averageRanking.toFixed(1),
		peak: data.peak,
		worst: data.worst,
		gap: data.worst - data.peak,
		top50PercentCount: top50PercentMap.get(data.id) ?? 0,
		top25PercentCount: top25PercentMap.get(data.id) ?? 0,
		top5PercentCount: top5PercentMap.get(data.id) ?? 0,
		rankings: trackRankingsMap?.get(data.id),
		rankChange: options.includeRankChange
			? prevTrackRankingMap?.get(data.id)
				? prevTrackRankingMap!.get(data.id)! - data.ranking
				: null
			: undefined,
	}));

	return result;
}
