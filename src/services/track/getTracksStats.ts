import { cache } from "react";
import { db } from "@/db/client";
import getUserPreference from "@/db/user";
import { buildTrackQueryCondition } from "./buildTrackQueryCondition";
import { defaultRankingSettings } from "@/features/settings/components/RankingSettingsForm";
import { DateRange } from "@/types/general";
import { Prisma } from "@prisma/client";
import { TrackMetrics, TrackStatsType } from "@/types/track";

type getTracksStatsProps = {
	artistId: string;
	userId: string;
	take?: number;
	dateRange?: DateRange;
};

async function getPercentileCounts(
	trackIds: string[],
	conditions: Prisma.TrackRankingWhereInput
) {
	const results = await db.trackRanking.findMany({
		where: {
			...conditions,
			trackId: { in: trackIds },
		},
		select: {
			trackId: true,
			rankPercentile: true,
		},
	});

	return trackIds.reduce(
		(acc, trackId) => {
			const trackRankings = results.filter((r) => r.trackId === trackId);
			acc[trackId] = {
				top50: trackRankings.filter((r) => r.rankPercentile <= 0.5).length,
				top25: trackRankings.filter((r) => r.rankPercentile <= 0.25).length,
				top5: trackRankings.filter((r) => r.rankPercentile <= 0.05).length,
			};
			return acc;
		},
		{} as Record<string, { top50: number; top25: number; top5: number }>
	);
}

async function getTracksMetrics(
	artistId: string,
	userId: string,
	take?: number,
	dateRange?: DateRange,
	trackQueryConditions?: Prisma.TrackWhereInput
) {
	const rankingData = await db.trackRanking.groupBy({
		by: ["trackId"],
		where: {
			userId,
			artistId,
			track: {
				...trackQueryConditions,
			},
			submission: {
				type: "ARTIST",
				status: "COMPLETED",
				...(dateRange && {
					createdAt: {
						...(dateRange.from && { gte: dateRange.from }),
						...(dateRange.to && { lte: dateRange.to }),
					},
				}),
			},
		},
		_min: {
			rank: true,
		},
		_max: {
			rank: true,
		},
		_avg: {
			rank: true,
		},
		_count: {
			_all: true,
		},
		orderBy: [
			{
				_avg: {
					rank: "asc",
				},
			},
			{
				_min: {
					rank: "asc",
				},
			},
			{
				_max: {
					rank: "asc",
				},
			},
			{
				trackId: "desc",
			},
		],
		take,
	});

	return rankingData.map(
		(item, index): TrackMetrics => ({
			id: item.trackId,
			ranking: index + 1,
			peak: item._min.rank ?? 0,
			worst: item._max.rank ?? 0,
			count: item._count._all,
			averageRanking: item._avg.rank ?? 0,
		})
	);
}

const getTracksStats = cache(async ({
	artistId,
	userId,
	take,
	dateRange,
}: getTracksStatsProps) => {
	const userPreference = await getUserPreference(userId);
	const trackQueryConditions = buildTrackQueryCondition(
		userPreference?.rankingSettings || defaultRankingSettings
	);

	const dateFilter = dateRange
		? {
				createdAt: {
					...(dateRange.from && { gte: dateRange.from }),
					...(dateRange.to && { lte: dateRange.to }),
				},
				status: "COMPLETED" as const,
			}
		: { status: "COMPLETED" as const };

	const trackMetrics = await getTracksMetrics(
		artistId,
		userId,
		take,
		dateRange,
		trackQueryConditions
	);
	const trackIds = trackMetrics.map((track) => track.id);

	const conditions: Prisma.TrackRankingWhereInput = {
		userId,
		artistId,
		submission: dateFilter,
		track: trackQueryConditions,
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

	const result: TrackStatsType[] = trackMetrics.map((data) => {
		const track = allTracksMap.get(data.id)!;
		const counts = percentileCounts[data.id] || { top50: 0, top25: 0, top5: 0 };

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
			sessionCount: data.count,
		};
	});

	return result;
});

export default getTracksStats;
