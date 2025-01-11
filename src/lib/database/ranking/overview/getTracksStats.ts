import { db } from "@/lib/prisma";
import { RankingData, TrackData } from "@/types/data";
import getTracksMetrics from "./getTracksMetrics";
import getRankingSession from "../../user/getRankingSession";

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
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;
	const latestSession = (await getRankingSession({ artistId, userId, time: {
		threshold: new Date(),
		filter: "lte",
	}}))?.[0];
	const prevTrackMetrics = await getTracksMetrics({
		artistId,
		userId,
		time: {
			threshold: latestSession?.date,
			filter: "lt",
		},
	});
	const trackMetrics = await getTracksMetrics({ artistId, userId, take, time });
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

	const modifiedTracks = tracks.map((track) => ({
		...track,
		rankings: track.rankings.map((ranking) => ({
			...ranking,
			date: ranking.date.date,
			percentage: ranking.ranking / ranking.date.rankings.length,
		})),
	}));

	const result = modifiedTracks.map((track) => {
		const trackMetric = trackMetrics.find((data) => data.id === track.id)!;
		const prevTrackMetric = prevTrackMetrics.find(
			(data) => data.id === track.id
		);

		let totalChartRun: number | null = null;
		for (const ranking of track.rankings) {
			if (ranking.rankChange !== null) {
				if (!totalChartRun) totalChartRun = Math.abs(ranking.rankChange);
				else totalChartRun = totalChartRun + Math.abs(ranking.rankChange);
			}
		}

		function filterRankings(max: number) {
			return track.rankings.filter((data) => data.ranking <= max);
		}

		function filterPercentage(max: number) {
			return track.rankings.filter((data) => data.percentage <= max);
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
			top10Count: filterRankings(10).length,
			top3Count: filterRankings(3).length,
			top1Count: filterRankings(1).length,
			top50PercentCount: filterPercentage(0.5).length,
			top25PercentCount: filterPercentage(0.25).length,
			top5PercentCount: filterPercentage(0.05).length,
			totalChartRun: track.rankings.length > 1 ? totalChartRun : null,
			rankings: track.rankings,
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
