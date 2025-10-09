import { cache } from "react";
import { db } from "@/db/client";
import getUserPreference from "@/db/user";
import { notFound } from "next/navigation";
import { buildTrackQueryCondition } from "./buildTrackQueryCondition";
import { defaultRankingSettings } from "@/features/settings/components/RankingSettingsForm";
import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";
import { TrackHistoryType } from "@/types/track";

type getTracksRankingHistoryOptions = {
	includeAchievement?: boolean;
};

type getTracksHistoryProps = {
	artistId: string;
	userId: string;
	submissionId: string;
	options?: getTracksRankingHistoryOptions;
	take?: number;
};

export const getTracksHistory = cache(async ({
	artistId,
	userId,
	submissionId,
	take,
}: getTracksHistoryProps): Promise<TrackHistoryType[]> => {
	const userPreference = await getUserPreference({ userId });
	const trackQueryConditions = buildTrackQueryCondition(
		userPreference?.rankingSettings || defaultRankingSettings
	);

	const rankings = await db.trackRanking.findMany({
		where: {
			artistId,
			userId,
			submissionId,
			track: trackQueryConditions,
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
			submissionId: true,
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
					id: true,
					createdAt: true,
				},
			},
		},
		take,
	});

	if (rankings.length === 0) notFound();

	const currentDate = rankings[0].submission.createdAt;
	const trackIds = rankings.map((ranking) => ranking.trackId);

	const historicalPeak = await db.trackRanking.groupBy({
		by: ["trackId"],
		where: {
			trackId: { in: trackIds },
			userId,
			artistId,
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
			{ peak: data._min.rank },
		])
	);

	const result = rankings.map((data) => {
		const historicalBest = historicalMap.get(data.trackId)?.peak;
		const isNewPeak = !historicalBest || data.rank < historicalBest;

		return {
			...data.track,
			rank: data.rank,
			rankPercentile: data.rankPercentile,
			rankChange: data.rankChange,
			date: currentDate,
			submissionId: data.submissionId,
			createdAt: currentDate,
			peak: isNewPeak ? data.rank : historicalBest,
			countSongs: rankings.length,
			achievement: isNewPeak ? ["New Peak" as AchievementType] : [],
			album: data.track.album,
		};
	});

	return result;
});
