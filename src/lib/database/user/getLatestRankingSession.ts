import { db } from "@/db/client";

type getLatestRankingSessionProps = {
    artistId: string;
    userId: string;
};

export default async function getLatestRankingSession({
    artistId,
    userId,
}: getLatestRankingSessionProps) {

    const latestSubmission = await db.rankingSubmission.findFirst({
        where: {
            artistId,
            userId,
            status: "COMPLETED",
        },
        include: {
            artist: true,
            trackRanks: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return latestSubmission ? {
        ...latestSubmission,
        date: latestSubmission.createdAt,
        rankings: latestSubmission.trackRanks,
    } : null;
}
