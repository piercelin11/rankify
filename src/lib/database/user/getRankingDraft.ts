import { db } from "@/lib/prisma";
import { RankingDraftData } from "@/types/data";

type getRankingDraftProps = {
    artistId: string; 
    userId: string;
};

export default async function getRankingDraft({artistId, userId}: getRankingDraftProps ): Promise<RankingDraftData | null> {
        
    const rankingDraft = await db.rankingDraft.findFirst({
        where: {
            artistId,
            userId
        }
    });

    return rankingDraft as RankingDraftData | null;
}
