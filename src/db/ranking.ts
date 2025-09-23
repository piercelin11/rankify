import { db } from "./client";

export async function getPeakRankings(peak: number, trackId: string, userId: string) {
    const peakRankings = await db.trackRanking.findMany({
        where: {
            trackId,
            rank: peak,
            userId,
        },
        include: {
            submission: {
                select: {
                    createdAt: true
                }
            },
        },
        orderBy: {
            submission: {
                createdAt: "asc",
            },
        },
    });

    return peakRankings.map(ranking => ({
        ...ranking,
        date: ranking.submission.createdAt,
        ranking: ranking.rank, // 保持向後相容的字段名
    }))
}

export async function getLatestArtistRankingSession(artistId: string, userId: string) {
    const latestSubmission = await db.rankingSubmission.findFirst({
        where: {
            artistId,
            userId,
            type: "ARTIST",
            status: "COMPLETED",
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            createdAt: true,
        },
    });

    return latestSubmission ? {
        id: latestSubmission.id,
        date: latestSubmission.createdAt,
    } : null;
}

export async function getArtistRankingSessions(artistId: string, userId: string) {
    const submissions = await db.rankingSubmission.findMany({
        where: {
            artistId,
            userId,
            type: "ARTIST",
            status: "COMPLETED",
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            createdAt: true,
        },
    });

    return submissions.map(submission => ({
        id: submission.id,
        date: submission.createdAt,
    }));
}