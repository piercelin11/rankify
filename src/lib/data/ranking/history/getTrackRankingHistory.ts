import { db } from "@/lib/prisma";
import getTrackMetrics from "../overall/getTrackMetrics";
import { AlbumData, ArtistData, RankingSessionData } from "@/types/data";

export type TrackHistoryType = {
	id: string;
	name: string;
	artistId: string;
	artist: ArtistData;
	albumId: string | null;
	album: AlbumData | null;
	dateId: string;
	date: RankingSessionData;
	ranking: number;
    img: string | null;
	peak: number;
	rankChange: number | null;
};

type GetTrackRankingHistoryProps = {
	artistId: string;
	userId: string;
	dateId: string;
	take?: number;
};

export async function getTrackRankingHistory({
	artistId,
	userId,
	dateId,
	take
}: GetTrackRankingHistoryProps): Promise<TrackHistoryType[]> {
	const trackMetrics = await getTrackMetrics({ artistId, userId });
    const rankings = await db.ranking.findMany({
        where: {
            artistId,
            userId,
            dateId,
        },
        orderBy: {
            ranking: "asc"
        },
        include: {
            track: true,
            album: true,
            artist: true,
            date: true,
        },
		take
    });

	const result = rankings.map((ranking) => {
		const findPeak = trackMetrics.find((metric) => metric.id === ranking.track.id);

		return {
			...ranking,
            ...ranking.track,
            peak: findPeak!.peak
		};
	});

	return result;
}
