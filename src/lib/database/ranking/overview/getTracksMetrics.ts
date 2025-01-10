import { db } from "@/lib/prisma";
import { getPastDateProps, getPastDate } from "@/lib/utils/helper";
import { getTracksStatsProps } from "./getTracksStats";

export default async function getTracksMetrics({
	artistId,
	userId,
	take,
	time,
}: getTracksStatsProps) {
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;

	//const dateThreshold = time && getPastDate(time);
	const rankingData = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			track: {
				artistId,
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
