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

export async function getLatestArtistRankingSession(artistId: string, userId: string) {
    const latestSession = await db.rankingSession.findFirst({
        where: {
            artistId,
            userId,
            type: "ARTIST",
        },
        orderBy: {
            date: "desc",
        },
        select: {
            id: true,
            date: true,
        },
    });

    return latestSession;
}