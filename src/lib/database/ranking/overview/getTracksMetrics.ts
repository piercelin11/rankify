import { db } from "@/db/client";
import { getTracksStatsProps } from "./getTracksStats";
import { getUserRankingPreference } from "../../user/getUserPreference";

export const TrackStatsOrder = [
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
]

export type TrackMetrics = {
	id: string;
	ranking: number;
	peak: number;
	worst: number;
	count: number;
	averageRanking: number;
};

export default async function getTracksMetrics({
	artistId,
	userId,
	take,
	dateRange,
}: getTracksStatsProps) {
	const trackConditions = await getUserRankingPreference({ userId });
	const rankingData = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			artistId,
			track: {
				...trackConditions,
			},
			rankingSession: {
				type: "ARTIST",
				...(dateRange && {
					date: {
						...(dateRange.from && { gte: dateRange.from }),
						...(dateRange.to && { lte: dateRange.to }),
					}
				})
			},
		},
		_min: {
			ranking: true,
		},
		_max: {
			ranking: true,
		},
		_avg: {
			ranking: true,
		},
		_count: {
			_all: true,
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
		take,
	});

	return rankingData.map((item, index): TrackMetrics => ({
		id: item.trackId,
		ranking: index + 1,
		peak: item._min.ranking ?? 0,
		worst: item._max.ranking ?? 0,
		count: item._count._all,
		averageRanking: item._avg.ranking ?? 0,
	}));
}
