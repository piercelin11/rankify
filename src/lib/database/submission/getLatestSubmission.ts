import { db } from "@/db/client";
import { RankingSubmissionData } from "@/types/data";
import { $Enums } from "@prisma/client";

type GetLatestSubmissionProps = {
    artistId: string;
    userId: string;
    type?: $Enums.SubmissionType;
};

export default async function getLatestSubmission({
    artistId,
    userId,
    type = "ARTIST",
}: GetLatestSubmissionProps): Promise<RankingSubmissionData | null> {
    const submission = await db.rankingSubmission.findFirst({
        where: {
            artistId,
            userId,
            type,
        },
        include: {
            artist: true,
            user: true,
            album: true,
            trackRanks: {
                include: {
                    track: true,
                },
                orderBy: {
                    rank: 'asc',
                },
            },
            albumRanks: {
                include: {
                    album: true,
                },
                orderBy: {
                    ranking: 'asc',
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return submission as RankingSubmissionData | null;
}