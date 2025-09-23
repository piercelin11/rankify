import { db } from "@/db/client";
import { RankingSubmissionData } from "@/types/data";
import { SubmissionStatus, $Enums } from "@prisma/client";

type GetSubmissionDraftProps = {
    artistId: string;
    userId: string;
    type?: $Enums.SubmissionType;
    albumId?: string;
};

export default async function getSubmissionDraft({
    artistId,
    userId,
    type = "ARTIST",
    albumId,
}: GetSubmissionDraftProps): Promise<RankingSubmissionData | null> {
    const submission = await db.rankingSubmission.findFirst({
        where: {
            artistId,
            userId,
            type,
            albumId: albumId || null,
            status: {
                in: [SubmissionStatus.DRAFT, SubmissionStatus.IN_PROGRESS],
            },
        },
        include: {
            artist: true,
            user: true,
            album: true,
        },
    });

    return submission as RankingSubmissionData | null;
}