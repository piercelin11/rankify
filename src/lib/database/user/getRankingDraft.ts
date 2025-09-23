import { db } from "@/db/client";
import { RankingSubmissionData } from "@/types/data";
import { $Enums } from "@prisma/client";

type getRankingDraftProps = {
    artistId: string;
    userId: string;
    type: $Enums.SubmissionType;
    albumId?: string;
};

export default async function getRankingDraft({artistId, userId, type, albumId}: getRankingDraftProps ): Promise<RankingSubmissionData | null> {

    const rankingDraft = await db.rankingSubmission.findFirst({
        where: {
            artistId,
            userId,
            type,
            albumId: albumId || null,
            status: "DRAFT"
        },
        include: {
            artist: true,
            album: true,
            trackRanks: {
                include: {
                    track: true
                }
            },
            albumRanks: {
                include: {
                    album: true
                }
            }
        }
    });

    return rankingDraft as RankingSubmissionData | null;
}
