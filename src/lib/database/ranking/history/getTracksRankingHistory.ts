import { db } from "@/db/client";
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
	achievement: AchievementType[];
};

type getTracksRankingHistoryOptions = {
	includeAchievement?: boolean;
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
			rankingSession: {
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
	let totalLogsCount = 0;
	if (options.includeAchievement) {
		latestSession = await getLatestRankingSession({ artistId, userId });
		totalLogsCount = (
			await db.rankingSession.findMany({
				where: {
					userId,
					artistId,
				},
				select: {
					id: true,
				},
			})
		).length;
	}

	const currentDate = rankings[0].rankingSession.date;
	const trackIds = rankings.map((ranking) => ranking.trackId);

	const historicalPeak = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			trackId: { in: trackIds },
			userId,
			artistId,
			rankingSession: { date: { lt: currentDate } },
		},
		_min: {
			ranking: true,
		},
		_max: {
			ranking: true,
		},
	});

	const historicalMap = new Map(
		historicalPeak.map((data) => [
			data.trackId,
			{ peak: data._min.ranking, worst: data._max.ranking },
		])
	);

	const result = rankings.map((data) => {
		const prevPeak = historicalMap.get(data.trackId)?.peak;
		const prevWorst = historicalMap.get(data.trackId)?.worst;

		const achievement: AchievementType[] = [];

		if (Number(data.rankChange) > rankings.length / 5)
			achievement.push("Big Jump");
		if (Number(data.rankChange) < -(rankings.length / 5))
			achievement.push("Big Drop");
		if (
			data.ranking < Number(prevPeak) &&
			latestSession?.id === dateId &&
			totalLogsCount > 2
		)
			achievement.push("New Peak");
		if (
			data.ranking > Number(prevWorst) &&
			latestSession?.id === dateId &&
			totalLogsCount > 3
		)
			achievement.push("New Low");
		

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
			achievement: achievement,
			album: data.album,
		};
	});

	return result;
}
