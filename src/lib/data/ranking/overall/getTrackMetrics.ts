import { db } from "@/lib/prisma";
import { getPastDateProps, getPastDate } from "@/lib/utils/helper";

type getTrackMetricsProps = {
	artistId: string;
	userId: string;
	take?: number;
	time?: getPastDateProps;
};

export default async function getTrackMetrics({
	artistId,
	userId,
	take,
	time,
}: getTrackMetricsProps) {
	const dateThreshold = time && getPastDate(time);
	const rankingData = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			track: {
				artistId,
			},
			date: {
				type: "ARTIST",
				date: {
					gte: dateThreshold,
				},
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
		orderBy: {
			_avg: {
				ranking: "asc",
			},
		},
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
