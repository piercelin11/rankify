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

	const rankings = await db.ranking.findMany({
		where: {
			artistId,
			userId,
			dateId,
			track: trackQueryConditions,
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

	const currentDate = rankings[0].rankingSession.date;
	const trackIds = rankings.map((ranking) => ranking.trackId);

	const historicalPeak = await db.ranking.groupBy({
		by: ["trackId"],
		where: {
			trackId: { in: trackIds },
			userId,
			artistId,
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
			{ peak: data._min.ranking },
		])
	);

	const result = rankings.map((data) => {
		const historicalBest = historicalMap.get(data.trackId)?.peak;
		const isNewPeak = !historicalBest || data.ranking < historicalBest;

		return {
			...data.track,
			ranking: data.ranking,
			rankPercentile: data.rankPercentile,
			rankChange: data.rankChange,
			dateId,
			date: currentDate,
			peak: isNewPeak ? data.ranking : historicalBest,
			countSongs: rankings.length,
			achievement: isNewPeak ? ["New Peak" as AchievementType] : [],
			album: data.album,
		};
	});

	return result;
}
