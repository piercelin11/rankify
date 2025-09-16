import { db } from "@/db/client";
import { TrackData } from "@/types/data";
import getTracksMetrics from "./getTracksMetrics";
import getUserPreference from "@/db/user";
import { buildTrackQueryCondition } from "./buildTrackQueryCondition";
import { defaultRankingSettings } from "@/features/settings/components/RankingSettingsForm";
import { DateRange } from "@/types/general";

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
};

export type getTracksStatsProps = {
	artistId: string;
	userId: string;
	take?: number;
	dateRange?: DateRange;
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
	const results = await db.ranking.findMany({
		where: {
			...conditions,
			trackId: { in: trackIds },
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

export default async function getTracksStats({
	artistId,
	userId,
	take,
	dateRange,
}: getTracksStatsProps): Promise<TrackStatsType[]> {
	const userPreference = await getUserPreference(userId);
		const trackQueryConditions = buildTrackQueryCondition(
			userPreference?.rankingSettings || defaultRankingSettings
		);

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
		track: trackQueryConditions,
	};

	const percentileCounts = await getPercentileCounts(trackIds, conditions);

	const allTracks = await db.track.findMany({
		where: {
			id: { in: trackIds },
			artistId,
			rankings: { some: { userId } },
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
		};
	});

	return result;
}
