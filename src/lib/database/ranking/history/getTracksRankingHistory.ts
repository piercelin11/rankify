import { db } from "@/lib/prisma";
import { TrackData } from "@/types/data";
import { getUserRankingPreference } from "../../user/getUserPreference";
import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";
import { notFound } from "next/navigation";
import { RankingSession } from "@prisma/client";
import getLatestRankingSession from "../../user/getLatestRankingSession";

export type TrackHistoryType = Omit<TrackData, "artist" | "album"> & {
	dateId: string;
	date: Date;
	album: {
		name: string;
		color: string | null;
	} | null;
	ranking: number;
	peak: number;
	rankChange: number | null;
	rankPercentile: number;
	achievement: AchievementType;
};

type getTracksRankingHistoryOptions = {
	includeAchievement: boolean;
};

type getTracksRankingHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
	options?: getTracksRankingHistoryOptions;
	take?: number;
};

const defaultOptions = {
	includeAchievement: false,
};

export async function getTracksRankingHistory({
	artistId,
	userId,
	dateId,
	options = defaultOptions,
	take,
}: getTracksRankingHistoryProps): Promise<TrackHistoryType[]> {
	const trackConditions = await getUserRankingPreference({ userId });
	const rankings = await db.ranking.findMany({
		where: {
			artistId,
			userId,
			dateId,
			track: trackConditions,
		},
		orderBy: {
			ranking: "asc",
		},
		select: {
			id: true,
			ranking: true,
			rankChange: true,
			rankPercentile: true,
			trackId: true,
			track: true,
			date: {
				select: {
					date: true,
				},
			},
			album: {
				select: {
					name: true,
					color: true,
				},
			},
		},
		take,
	});

	if (rankings.length === 0) notFound();

	let latestSession: RankingSession | null = null;
	if (options.includeAchievement)
		latestSession = await getLatestRankingSession({ artistId, userId });

	const currentDate = rankings[0].date.date;
	const trackIds = rankings.map((ranking) => ranking.trackId);

	const historicalPeak = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			trackId: { in: trackIds },
			userId,
			artistId,
			date: { date: { lt: currentDate } },
		},
		_min: {
			ranking: true,
		}
	});

	const historicalPeakMap = new Map(
		historicalPeak.map((data) => [data.trackId, data._min.ranking])
	);

	console.log(historicalPeak)

	const result = rankings.map((data) => {
		const prevPeak = historicalPeakMap.get(data.trackId);

		function getAchievement(): AchievementType {
			if (!latestSession) return null;
			if (data.ranking < Number(prevPeak) && latestSession.id === dateId)
				return "New Peak";
			else if (Number(data.rankChange) > rankings.length / 5) return "Big Jump";
			else if (Number(data.rankChange) < -(rankings.length / 5))
				return "Big Drop";
			else return null;
		}

		return {
			...data.track,
			ranking: data.ranking,
			rankPercentile: data.rankPercentile,
			rankChange: data.rankChange,
			dateId,
			date: currentDate,
			peak:
				!prevPeak || data.ranking < Number(prevPeak)
					? data.ranking
					: Number(prevPeak),
			countSongs: rankings.length,
			achievement: getAchievement(),
			album: data.album,
		};
	});

	return result;
}
