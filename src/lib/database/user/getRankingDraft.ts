import { db } from "@/db/client";
import { RankingDraftData } from "@/types/data";
import { $Enums } from "@prisma/client";

type getRankingDraftProps = {
    artistId: string;
    userId: string;
    type: $Enums.RankingType;
    albumId?: string;
};

export default async function getRankingDraft({artistId, userId, type, albumId}: getRankingDraftProps ): Promise<RankingDraftData | null> {

    const rankingDraft = await db.rankingDraft.findFirst({
        where: {
            artistId,
            userId,
            type,
            albumId: albumId || null
        }
    });

    return rankingDraft as RankingDraftData | null;
}
