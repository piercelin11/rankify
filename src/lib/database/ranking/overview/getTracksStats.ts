import { db } from "@/lib/prisma";
import { RankingData, TrackData } from "@/types/data";
import getTracksMetrics from "./getTracksMetrics";
import getRankingSession from "../../user/getRankingSession";
import { getUserRankingPreference } from "../../user/getUserPreference";

export type TrackStatsType = TrackData & {
	ranking: number;
	averageRanking: number;
	peak: number;
	worst: number;
	gap: number | null;
	top50PercentCount: number;
	top25PercentCount: number;
	top5PercentCount: number;
	top10Count: number;
	top3Count: number;
	top1Count: number;
	totalChartRun: number | null;
	rankings: (RankingData & { date: Date })[];
	loggedCount: number;
	rankChange?: number | null;
};

export type TimeFilterType = {
	threshold?: Date;
	filter: "gte" | "lte" | "gt" | "lt" | "equals";
};

export type getTracksStatsProps = {
	artistId: string;
	userId: string;
	take?: number;
	time?: TimeFilterType;
};

export default async function getTracksStats({
	artistId,
	userId,
	take,
	time,
}: getTracksStatsProps): Promise<TrackStatsType[]> {
	const trackConditions = await getUserRankingPreference({ userId });
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;
	const latestSession = (
		await getRankingSession({
			artistId,
			userId,
			time: {
				threshold: new Date(),
				filter: "lte",
			},
		})
	)?.[0];
	const trackMetrics = await getTracksMetrics({ artistId, userId, take, time });
	const prevTrackMetrics = await getTracksMetrics({
		artistId,
		userId,
		time: {
			threshold: latestSession?.date,
			filter: "lt",
		},
	});
	const tookTrackIds = take ? trackMetrics.map((track) => track.id) : undefined;

	const tracks = await db.track.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
					date: {
						date,
					},
				},
			},
			id: { in: tookTrackIds },
			...trackConditions,
		},
		include: {
			album: true,
			artist: true,
			rankings: {
				where: {
					userId,
					date: {
						date,
					},
				},
				include: {
					date: {
						select: {
							date: true,
							rankings: true,
						},
					},
				},
				orderBy: {
					date: {
						date: "asc",
					},
				},
			},
		},
	});

	const trackMetricsMap = new Map(trackMetrics.map(track => [track.id, track]));
	const prevTrackMetricsMap = new Map(prevTrackMetrics.map(track => [track.id, track]));

	const result = tracks.map((track) => {
		const trackMetric = trackMetricsMap.get(track.id)!;
		const prevTrackMetric = prevTrackMetricsMap.get(track.id);

		const rankings = track.rankings.map((ranking) => ({
			...ranking,
			date: ranking.date.date,
			percentage: ranking.ranking / ranking.date.rankings.length,
		}));

		let totalChartRun: number | null = null;
		const stats = {
			top10Count: 0,
			top3Count: 0,
			top1Count: 0,
			top50PercentCount: 0,
			top25PercentCount: 0,
			top5PercentCount: 0,
		};
		for (const ranking of rankings) {
			if (ranking.rankChange !== null) {
				totalChartRun = (totalChartRun || 0) + Math.abs(ranking.rankChange);
			}

			if (ranking.ranking <= 10) stats.top10Count++;
			if (ranking.ranking <= 3) stats.top3Count++;
			if (ranking.ranking <= 1) stats.top1Count++;
			if (ranking.percentage <= 0.5) stats.top50PercentCount++;
			if (ranking.percentage <= 0.25) stats.top25PercentCount++;
			if (ranking.percentage <= 0.05) stats.top5PercentCount++;
		}

		return {
			...track,
			ranking: trackMetric.ranking,
			averageRanking: trackMetrics.find((data) => data.id === track.id)!
				.averageRanking,
			peak: trackMetric.peak,
			worst: trackMetric.worst,
			gap:
				track.rankings.length > 1
					? Math.abs(trackMetric.worst - trackMetric.peak)
					: null,
			...stats,
			totalChartRun: track.rankings.length > 1 ? totalChartRun : null,
			rankings,
			loggedCount: track.rankings.length,
			rankChange: time?.threshold
				? undefined
				: prevTrackMetric
					? prevTrackMetric.ranking - trackMetric.ranking
					: null,
		};
	});
	return result.sort((a, b) => a.ranking - b.ranking);
}
