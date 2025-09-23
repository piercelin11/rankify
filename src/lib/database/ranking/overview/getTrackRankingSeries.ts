import { db } from "@/db/client";

export type TrackRankingSeriesType = Map<
    string,
    {
        rank: number;
        createdAt: Date;
        submissionId: string;
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
            trackRanks: {
                some: {
                    userId,
                },
            },
        },
        select: {
            id: true,
            name: true,
            color: true,
            trackRanks: {
                where: {
                    submission: { status: "COMPLETED" },
                },
                select: {
                    submission: {
                        select: { createdAt: true, id: true },
                    },
                    rank: true,
                },
                orderBy: {
                    submission: {
                        createdAt: "asc",
                    },
                },
            },
        },
    });

    for (const track of trackRanking) {
        const rankings = track.trackRanks.map((data) => ({
            rank: data.rank,
            createdAt: data.submission.createdAt,
            submissionId: data.submission.id,
        }));
        result.set(track.id, rankings);
    }

    return result;
}
