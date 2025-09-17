import { db } from "./client";

export async function getPeakRankings(peak: number, trackId: string, userId: string) {
    const peakSession = await db.ranking.findMany({
        where: {
            trackId,
            ranking: peak,
            userId,
        },
        include: {
            rankingSession: {
                select: {
                    date: true
                }
            },
        },
        orderBy: {
            rankingSession: {
                date: "asc",
            },
        },
    });

    return peakSession.map(session => ({
        ...session,
        date: session.rankingSession.date,
    }))
}