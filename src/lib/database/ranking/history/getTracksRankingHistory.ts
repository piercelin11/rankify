import { db } from "@/lib/prisma";
import getTracksMetrics from "../overview/getTracksMetrics";
import { RankingSessionData, TrackData } from "@/types/data";
import getRankingSession from "../../user/getRankingSession";

export type TrackHistoryType = TrackData & {
	dateId: string;
	date: RankingSessionData;
	ranking: number;
	peak: number;
	rankChange: number | null;
	isLatest: boolean;
	countSongs: number;
};

type getTracksRankingHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
	take?: number;
};

export async function getTracksRankingHistory({
	artistId,
	userId,
	dateId,
	take,
}: getTracksRankingHistoryProps): Promise<TrackHistoryType[]> {

	const trackMetrics = await getTracksMetrics({ artistId, userId });
	const latestSession = (await getRankingSession({ artistId, userId }))[0];
	const rankings = await db.ranking.findMany({
		where: {
			artistId,
			userId,
			dateId,
		},
		orderBy: {
			ranking: "asc",
		},
		include: {
			track: true,
			album: true,
			artist: true,
			date: true,
		},
		take,
	});

	const result = rankings.map((ranking) => {
		const findPeak = trackMetrics.find(
			(metric) => metric.id === ranking.track.id
		);

		return {
			...ranking,
			...ranking.track,
			peak: findPeak!.peak,
			isLatest: latestSession.id === ranking.dateId,
			countSongs: rankings.length,
		};
	});

	return result;
}
