import { db } from "@/db/client";
import { TrackData } from "@/types/data";
import { getUserRankingPreference } from "../../user/getUserPreference";
import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";
import { notFound } from "next/navigation";
import { RankingSubmission } from "@prisma/client";
import getLatestRankingSession from "../../user/getLatestRankingSession";

export type TrackHistoryType = Omit<TrackData, "artist" | "album"> & {
	submissionId: string;
	createdAt: Date;
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
	submissionId: string;
	options?: getTracksRankingHistoryOptions;
	take?: number;
};

const defaultOptions = {
	includeAchievement: false,
};

export async function getTracksRankingHistory({
	artistId,
	userId,
	submissionId,

	options = defaultOptions,
	take,
}: getTracksRankingHistoryProps): Promise<TrackHistoryType[]> {
	const trackConditions = await getUserRankingPreference({ userId });
	const rankings = await db.trackRanking.findMany({
		where: {
			artistId,
			userId,
			submissionId,
			track: trackConditions,
			submission: { status: "COMPLETED" },
		},
		orderBy: {
			rank: "asc",
		},
		select: {
			id: true,
			rank: true,
			rankChange: true,
			rankPercentile: true,
			trackId: true,
			track: {
				include: {
					album: {
						select: {
							name: true,
							color: true,
						},
					},
				},
			},
			submission: {
				select: {
					createdAt: true,
				},
			},
		},
		take,
	});

	if (rankings.length === 0) notFound();

	let latestSession: RankingSubmission | null = null;
	let totalLogsCount = 0;
	if (options.includeAchievement) {
		latestSession = await getLatestRankingSession({ artistId, userId });
		totalLogsCount = (
			await db.rankingSubmission.findMany({
				where: {
					userId,
					artistId,
					status: "COMPLETED",
				},
				select: {
					id: true,
				},
			})
		).length;
	}

	const currentDate = rankings[0].submission.createdAt;
	const trackIds = rankings.map((ranking) => ranking.trackId);

	const historicalPeak = await db.trackRanking.groupBy({
		by: ["trackId"],
		where: {
			trackId: { in: trackIds },
			userId,
			artistId,
			submission: {
				createdAt: { lt: currentDate },
				status: "COMPLETED"
			},
		},
		_min: {
			rank: true,
		},
		_max: {
			rank: true,
		},
	});

	const historicalMap = new Map(
		historicalPeak.map((data) => [
			data.trackId,
			{ peak: data._min.rank, worst: data._max.rank },
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
			data.rank < Number(prevPeak) &&
			latestSession?.id === submissionId &&
			totalLogsCount > 2
		)
			achievement.push("New Peak");
		if (
			data.rank > Number(prevWorst) &&
			latestSession?.id === submissionId &&
			totalLogsCount > 3
		)
			achievement.push("New Low");
		

		return {
			...data.track,
			ranking: data.rank,
			rankPercentile: data.rankPercentile,
			rankChange: data.rankChange,
			submissionId,
			createdAt: currentDate,
			peak:
				!prevPeak || data.rank < Number(prevPeak)
					? data.rank
					: Number(prevPeak),
			countSongs: rankings.length,
			achievement: achievement,
			album: data.track.album,
		};
	});

	return result;
}
