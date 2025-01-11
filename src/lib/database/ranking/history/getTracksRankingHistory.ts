import { db } from "@/lib/prisma";
import getTracksMetrics from "../overview/getTracksMetrics";
import { RankingSessionData, TrackData } from "@/types/data";
import getRankingSession from "../../user/getRankingSession";
import { AchievementType } from "@/components/display/ranking/AchievementDisplay";

export type TrackHistoryType = TrackData & {
	dateId: string;
	date: RankingSessionData;
	ranking: number;
	peak: number;
	rankChange: number | null;
	achievement: AchievementType;
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
	const sessions = await getRankingSession({ artistId, userId });
	const latestSession = sessions[0];
	const currentSession = sessions.find((session) => session.id === dateId);
	const prevTrackMetrics = await getTracksMetrics({
		artistId,
		userId,
		time: { threshold: currentSession?.date, filter: "lt" },
	});

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
		const findPrevPeak = prevTrackMetrics.find(
			(metric) => metric.id === ranking.track.id
		);
		const dataIsLatest = latestSession.id === ranking.dateId;

		function getAchievement(): AchievementType {
			if (ranking.ranking < Number(findPrevPeak?.peak) && dataIsLatest)
				return "New Peak";
			else if (Number(ranking.rankChange) > rankings.length / 5)
				return "Big Jump";
			else if (Number(ranking.rankChange) < -(rankings.length / 5))
				return "Big Drop";
			else return null;
		}

		return {
			...ranking,
			...ranking.track,
			peak:
				!findPrevPeak?.peak || ranking.ranking < Number(findPrevPeak?.peak)
					? ranking.ranking
					: Number(findPrevPeak?.peak),
			isLatest: latestSession.id === ranking.dateId,
			countSongs: rankings.length,
			achievement: getAchievement(),
		};
	});

	return result;
}


