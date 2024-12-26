import { db } from "@/lib/prisma";

type getAlbumRankingsProps = {
    artistId: string;
    userId: string;
};

export default async function getRankingSession({artistId, userId}: getAlbumRankingsProps ) {

    const rankingSessions = await db.rankingSession.findMany({
        where: {
            artistId,
            userId
        },
        include: {
            artist: true,
        },
        orderBy: {
            date: "desc"
        }
    });

    return rankingSessions;
}
