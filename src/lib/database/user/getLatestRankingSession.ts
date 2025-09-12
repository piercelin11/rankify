import { db } from "@/lib/prisma";

type getLatestRankingSessionProps = {
    artistId: string;
    userId: string;
};

export default async function getLatestRankingSession({
    artistId,
    userId,
}: getLatestRankingSessionProps) {

    const rankingSessions = await db.rankingSession.findFirst({
        where: {
            artistId,
            userId,
        },
        include: {
            artist: true,
            rankings: true,
        },
        orderBy: {
            date: "desc",
        },
    });

    return rankingSessions;
}
