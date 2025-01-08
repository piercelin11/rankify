import { db } from "@/lib/prisma";
//import { unstable_cacheTag as cacheTag } from "next/cache";

type getAlbumRankingsProps = {
    artistId: string;
    userId: string;
};

export default async function getRankingSession({artistId, userId}: getAlbumRankingsProps ) {
    //"use cache";
    //cacheTag("user-data");
    const rankingSessions = await db.rankingSession.findMany({
        where: {
            artistId,
            userId
        },
        include: {
            artist: true,
            rankings: true,
        },
        orderBy: {
            date: "desc"
        }
    });

    return rankingSessions;
}
