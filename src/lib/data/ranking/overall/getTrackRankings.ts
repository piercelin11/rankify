import { db } from "@/lib/prisma";
import { AlbumData, ArtistData, RankingData, TrackData } from "@/types/data";
import getTrackMetrics from "./getTrackMetrics";
import { getPastDate, getPastDateProps } from "@/lib/utils/helper";

export type OverallTrackRankingsType = {
	id: string;
	name: string;
	artist: ArtistData;
	artistId: string;
	releaseDate: Date | null;
	ranking: number;
	averageRanking: number;
	peak: number;
	worst: number;
	albumId: string | null;
	album: AlbumData | null;
	color?: string | null;
	trackNumber: number | null;
	top100Count: number;
	top10Count: number;
	top1Count: number;
	totalChartRun: number | null;
	rankings: (RankingData & { date: Date })[];
} & Omit<TrackData, "artist" | "album">;

type getTrackRankingsProps = {
	artistId: string;
	userId: string;
	take?: number;
	time?: getPastDateProps;
};

export default async function getTrackRankings({
	artistId,
	userId,
	take,
	time,
}: getTrackRankingsProps): Promise<OverallTrackRankingsType[]> {
	const trackMetrics = await getTrackMetrics({ artistId, userId, take, time });
	const tookTrackIds = take ? trackMetrics.map((track) => track.id) : undefined;
	const dateThreshold = time && getPastDate(time);

	const tracks = await db.track.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
					date: {
						date: {
							gte: dateThreshold
						}
					}
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
						date: {
							gte: dateThreshold
						}
					}
				},
				include: {
					date: {
						select: {
							date: true,
						},
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
		})),
	}));

	const result = modifiedTracks.map((track) => {
		const trackMetric = trackMetrics.find((data) => data.id === track.id)!;

		function filterRankings(max: number) {
			return track.rankings.filter((data) => data.ranking <= max);
		}

		return {
			...track,
			ranking: trackMetric.ranking,
			averageRanking: trackMetrics.find((data) => data.id === track.id)!
				.averageRanking,
			peak: trackMetric.peak,
			worst: trackMetric.worst,
			top100Count: filterRankings(100).length,
			top10Count: filterRankings(10).length,
			top1Count: filterRankings(1).length,
			totalChartRun: track.rankings.reduce((acc: null | number, cur) => {
				if (!cur.rankChange) return null;
				if (!acc) return Math.abs(cur.rankChange);
				return acc + Math.abs(cur.rankChange);
			}, null),
			rankings: track.rankings,
		};
	});

	return result.sort((a, b) => a.ranking - b.ranking);
}
