import { db } from "@/db/client";
import { getTracksStatsProps } from "./getTracksStats";
import { getUserRankingPreference } from "../../user/getUserPreference";

export const TrackStatsOrder = [
	{
		_avg: {
			rank: "asc",
		},
	},
	{
		_min: {
			rank: "asc",
		},
	},
	{
		_max: {
			rank: "asc",
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
	const rankingData = await db.trackRanking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			artistId,
			track: {
				...trackConditions,
			},
			submission: {
				type: "ARTIST",
				status: "COMPLETED",
				...(dateRange && {
					createdAt: {
						...(dateRange.from && { gte: dateRange.from }),
						...(dateRange.to && { lte: dateRange.to }),
					}
				})
			},
		},
		_min: {
			rank: true,
		},
		_max: {
			rank: true,
		},
		_avg: {
			rank: true,
		},
		_count: {
			_all: true,
		},
		orderBy: [
			{
				_avg: {
					rank: "asc",
				},
			},
			{
				_min: {
					rank: "asc",
				},
			},
			{
				_max: {
					rank: "asc",
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
		peak: item._min.rank ?? 0,
		worst: item._max.rank ?? 0,
		count: item._count._all,
		averageRanking: item._avg.rank ?? 0,
	}));
}
