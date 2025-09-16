import { db } from "@/db/client";

export type TrackRankingSeriesType = Map<
    string,
    {
        ranking: number;
        date: Date;
        dateId: string;
    }[]
>;

type getTrackRankingSeriesProps = {
    artistId: string;
    userId: string;
};

export default async function getTrackRankingSeries({
    artistId,
    userId,
}: getTrackRankingSeriesProps) {
    const result: TrackRankingSeriesType = new Map();
    const trackRanking = await db.track.findMany({
        where: {
            artistId,
            rankings: {
                some: {
                    userId,
                },
            },
        },
        select: {
            id: true,
            name: true,
            color: true,
            rankings: {
                select: {
                    date: {
                        select: { date: true, id: true },
                    },
                    ranking: true,
                },
                orderBy: {
                    date: {
                        date: "asc",
                    },
                },
            },
        },
    });

    for (const track of trackRanking) {
        const rankings = track.rankings.map((data) => ({
            ranking: data.ranking,
            date: data.date.date,
            dateId: data.date.id,
        }));
        result.set(track.id, rankings);
    }

    return result;
}
