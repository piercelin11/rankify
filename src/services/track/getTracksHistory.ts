import { db } from "@/db/client";
import { TrackData } from "@/types/data";
import getUserPreference from "@/db/user";
import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";
import { notFound } from "next/navigation";
import { buildTrackQueryCondition } from "./buildTrackQueryCondition";
import { defaultRankingSettings } from "@/features/settings/components/RankingSettingsForm";

export type TrackHistoryType = Omit<TrackData, "artist" | "album"> & {
	dateId: string;
	date: Date;
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

type getTracksHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
	options?: getTracksRankingHistoryOptions;
	take?: number;
};

export async function getTracksHistory({
	artistId,
	userId,
	dateId,
	take,
}: getTracksHistoryProps): Promise<TrackHistoryType[]> {
	const userPreference = await getUserPreference(userId);
	const trackQueryConditions = buildTrackQueryCondition(
		userPreference?.rankingSettings || defaultRankingSettings
	);

	const rankings = await db.trackRanking.findMany({
		where: {
			artistId,
			userId,
			submissionId: dateId,
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
			ranking: data.rank,
			rankPercentile: data.rankPercentile,
			rankChange: data.rankChange,
			dateId,
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
}
