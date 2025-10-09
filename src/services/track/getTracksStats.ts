import { cache } from "react";
import { db } from "@/db/client";
import { TrackStatsType } from "@/types/track";

type getTracksStatsProps = {
	artistId: string;
	userId: string;
	take?: number;
};

async function getPercentileCounts(trackIds: string[]) {
	const results = await db.trackRanking.findMany({
		where: {
			trackId: { in: trackIds },
			submission: { type: "ARTIST", status: "COMPLETED" },
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

const getTracksStats = cache(
	async ({
		artistId,
		userId,
	}: getTracksStatsProps): Promise<TrackStatsType[]> => {
		const trackStats = await db.trackStats.findMany({
			where: {
				artistId,
				userId,
			},
			include: {
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
			},
			orderBy: {
				overallRank: "asc",
			},
		});

		const trackIds = trackStats.map((stats) => stats.track.id);
		const percentileCounts = await getPercentileCounts(trackIds);

		const result: TrackStatsType[] = trackStats.map((data) => {
			const counts = percentileCounts[data.track.id] || {
				top50: 0,
				top25: 0,
				top5: 0,
			};

			const { track, ...restTrackStats } = data;
			const { album, ...restTrackData } = track;

			return {
				...restTrackStats,
				...restTrackData,
				rank: data.overallRank,
				album: {
					name: album?.name ?? null,
					color: album?.color ?? null,
				},
				gap: data.lowestRank - data.highestRank,
				top50PercentCount: counts.top50,
				top25PercentCount: counts.top25,
				top5PercentCount: counts.top5,
			};
		});

		return result;
	}
);

export default getTracksStats;
