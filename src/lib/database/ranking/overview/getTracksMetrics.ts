import { db } from "@/lib/prisma";
import { getTracksStatsProps } from "./getTracksStats";
import { getUserRankingPreference } from "../../user/getUserPreference";

export default async function getTracksMetrics({
	artistId,
	userId,
	take,
	time,
}: getTracksStatsProps) {
	const trackConditions = await getUserRankingPreference({ userId });
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;

	const rankingData = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			track: {
				artistId,
				...trackConditions,
			},
			date: {
				type: "ARTIST",
				date,
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

	return rankingData.map((item, index) => ({
		id: item.trackId,
		ranking: index + 1,
		peak: item._min.ranking ?? 0,
		worst: item._max.ranking ?? 0,
		averageRanking: item._avg.ranking ?? 0,
	}));
}
