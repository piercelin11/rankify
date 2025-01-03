import { db } from "@/lib/prisma";
import { auth } from "@/../auth";

type getRankingDraftProps = {
    artistId: string;
    userId: string;
};

export default async function getRankingDraft({artistId, userId}: getRankingDraftProps ) {
        
    const rankingDraft = await db.rankingDraft.findFirst({
        where: {
            artistId,
            userId
        }
    });

    return rankingDraft;
}
