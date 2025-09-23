import { db } from "@/db/client";
import { TrackData } from "@/types/data";
import getTracksMetrics, { TrackMetrics } from "./getTracksMetrics";
import { getUserRankingPreference } from "../../user/getUserPreference";
import getLatestRankingSession from "../../user/getLatestRankingSession";
import getTrackRankingSeries, {
	TrackRankingSeriesType,
} from "./getTrackRankingSeries";
import { getTracksWithHotStreak } from "./getTracksWithHotStreak";
import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";
import { getTracksWithColdStreak } from "./getTracksWithColdStreak";

export type TrackStatsType = Omit<TrackData, "artist" | "album"> & {
	ranking: number;
	averageRanking: number | string;
	peak: number;
	worst: number;
	gap: number | null;
	album: {
		name: string | null;
		color: string | null;
	};
	top50PercentCount: number;
	top25PercentCount: number;
	top5PercentCount: number;
	rankings?: { rank: number; createdAt: Date; submissionId: string }[];
	rankChange?: number | null;
	achievement: AchievementType[];
};

export type DateRange = {
	from?: Date;
	to?: Date;
};

export type getTracksStatsProps = {
	artistId: string;
	userId: string;
	options?: getTracksStatsOptions;
	take?: number;
	dateRange?: DateRange;
};

type getTracksStatsOptions = {
	includeRankChange?: boolean;
	includeAllRankings?: boolean;
	includeAchievement?: boolean;
};

const defaultOptions = {
	includeRankChange: false,
	includeAllRankings: false,
	includeAchievement: false,
};

type QueryConditions = {
	userId: string;
	artistId: string;
	date?: {
		date?: {
			gte?: Date;
			lte?: Date;
		};
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	track: any;
};

async function getPercentileCounts(
	trackIds: string[],
	conditions: QueryConditions
) {
	const results = await db.trackRanking.findMany({
		where: {
			...conditions,
			trackId: { in: trackIds },
			submission: { status: "COMPLETED" },
		},
		select: {
			trackId: true,
			rankPercentile: true,
		},
	});

	return trackIds.reduce((acc, trackId) => {
		const trackRankings = results.filter(r => r.trackId === trackId);
		acc[trackId] = {
			top50: trackRankings.filter(r => r.rankPercentile <= 0.5).length,
			top25: trackRankings.filter(r => r.rankPercentile <= 0.25).length,
			top5: trackRankings.filter(r => r.rankPercentile <= 0.05).length,
		};
		return acc;
	}, {} as Record<string, { top50: number; top25: number; top5: number }>);
}

async function getAchievements(
	userId: string,
	artistId: string,
	trackMetrics: TrackMetrics[]
) {
	const hotStreakTrackIds = await getTracksWithHotStreak({
		userId,
		artistId,
	});
	const coldStreakTrackIds = await getTracksWithColdStreak({
		userId,
		artistId,
	});
	const burningStreakTrackIds = await getTracksWithHotStreak({
		userId,
		artistId,
		streak: 5,
	});
	const freezingStreakTrackIds = await getTracksWithColdStreak({
		userId,
		artistId,
		streak: 5,
	});

	return {
		hotStreakTrackIds,
		coldStreakTrackIds,
		burningStreakTrackIds,
		freezingStreakTrackIds,
		calculateTrackAchievement: (trackId: string, worst: number, peak: number, count: number): AchievementType[] => {
			const hasHotStreak = hotStreakTrackIds?.has(trackId);
			const hasColdStreak = coldStreakTrackIds?.has(trackId);
			const hasBurningStreak = burningStreakTrackIds?.has(trackId);
			const hasFreezingStreak = freezingStreakTrackIds?.has(trackId);

			const achievement: AchievementType[] = [];
			if (hasBurningStreak) achievement.push("Surge");
			else if (hasHotStreak) achievement.push("Ascent");

			if (hasFreezingStreak) achievement.push("Plunge");
			else if (hasColdStreak) achievement.push("Descent");

			if (worst - peak > trackMetrics.length / 2 && count > 2)
				achievement.push("Drifter");
			if (worst - peak < trackMetrics.length / 8 && count > 3)
				achievement.push("Anchor");

			return achievement;
		}
	};
}

export default async function getTracksStats({
	artistId,
	userId,
	options = defaultOptions,
	take,
	dateRange,
}: getTracksStatsProps): Promise<TrackStatsType[]> {
	const trackConditions = await getUserRankingPreference({ userId });

	const dateFilter = dateRange ? {
		date: {
			...(dateRange.from && { gte: dateRange.from }),
			...(dateRange.to && { lte: dateRange.to }),
		}
	} : undefined;

	const trackMetrics = await getTracksMetrics({
		artistId,
		userId,
		take,
		dateRange
	});
	const trackIds = trackMetrics.map((track) => track.id);

	const conditions: QueryConditions = {
		userId,
		artistId,
		date: dateFilter,
		track: trackConditions,
	};

	const percentileCounts = await getPercentileCounts(trackIds, conditions);

	const allTracks = await db.track.findMany({
		where: {
			id: { in: trackIds },
			artistId,
			trackRanks: { some: { userId } },
		},
		include: {
			album: {
				select: {
					name: true,
					color: true,
				},
			},
		},
	});
	const allTracksMap = new Map(allTracks.map((track) => [track.id, track]));

	let prevTrackRankingMap: Map<string, number> | undefined;
	if (options.includeRankChange && !dateRange) {
		const latestSession = await getLatestRankingSession({ userId, artistId });
		const prevTrackRanking = await db.trackRanking.groupBy({
			by: ["trackId"],
			where: {
				userId,
				artistId,
				submission: {
					createdAt: { lt: latestSession?.createdAt },
					status: "COMPLETED"
				},
			},
			orderBy: [
				{ _avg: { rank: "asc" } },
				{ _min: { rank: "asc" } },
				{ _max: { rank: "asc" } },
				{ trackId: "desc" },
			],
		});
		prevTrackRankingMap = new Map(
			prevTrackRanking.map((track, index) => [track.trackId, index + 1])
		);
	}

	let trackRankingsMap: TrackRankingSeriesType | undefined;
	if (options.includeAllRankings && !dateRange) {
		trackRankingsMap = await getTrackRankingSeries({ artistId, userId });
	}

	let achievementHelper: Awaited<ReturnType<typeof getAchievements>> | undefined;
	if (options.includeAchievement && !dateRange) {
		achievementHelper = await getAchievements(userId, artistId, trackMetrics);
	}

	const result: TrackStatsType[] = trackMetrics.map((data) => {
		const track = allTracksMap.get(data.id)!;
		const counts = percentileCounts[data.id] || { top50: 0, top25: 0, top5: 0 };
		const achievement = achievementHelper
			? achievementHelper.calculateTrackAchievement(data.id, data.worst, data.peak, data.count)
			: [];

		return {
			...track,
			album: {
				name: track.album?.name ?? null,
				color: track.album?.color ?? null,
			},
			ranking: data.ranking,
			averageRanking: data.averageRanking.toFixed(1),
			peak: data.peak,
			worst: data.worst,
			gap: data.worst - data.peak,
			top50PercentCount: counts.top50,
			top25PercentCount: counts.top25,
			top5PercentCount: counts.top5,
			rankings: trackRankingsMap?.get(data.id),
			achievement,
			rankChange: options.includeRankChange && !dateRange
				? prevTrackRankingMap?.get(data.id)
					? prevTrackRankingMap.get(data.id)! - data.ranking
					: null
				: undefined,
		};
	});

	return result;
}
