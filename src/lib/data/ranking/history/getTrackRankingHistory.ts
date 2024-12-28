import { db } from "@/lib/prisma";
import getTrackMetrics from "../overall/getTrackMetrics";
import { RankingSessionData, TrackData } from "@/types/data";
import getRankingSession from "../../user/getRankingSession";

export type TrackHistoryType = TrackData & {
	dateId: string;
	date: RankingSessionData;
	ranking: number;
	peak: number;
	rankChange: number | null;
	isLatest: boolean
};

type GetTrackRankingHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
	take?: number;
};

export async function getTrackRankingHistory({
	artistId,
	userId,
	dateId,
	take
}: GetTrackRankingHistoryProps): Promise<TrackHistoryType[]> {
	const trackMetrics = await getTrackMetrics({ artistId, userId });
	const latestSession = (await getRankingSession({artistId, userId}))[0];
    const rankings = await db.ranking.findMany({
        where: {
            artistId,
            userId,
            dateId,
        },
        orderBy: {
            ranking: "asc"
        },
        include: {
            track: true,
            album: true,
            artist: true,
            date: true,
        },
		take
    });

	const result = rankings.map((ranking) => {
		const findPeak = trackMetrics.find((metric) => metric.id === ranking.track.id);

		return {
			...ranking,
            ...ranking.track,
            peak: findPeak!.peak,
			isLatest: latestSession.id === ranking.dateId
		};
	});

	return result;
}
