import { db } from "@/db/client";
import { $Enums, Prisma, RankingSubmission } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { RankingResultData } from "../../sorter/components/SortingStage";

type createRankingSubmissionProps = {
	trackRankings: RankingResultData[];
	userId: string;
	type: $Enums.SubmissionType;
	albumId?: string;
};

export default async function createRankingSubmission(
	{ trackRankings, userId, type, albumId }: createRankingSubmissionProps,
	prisma: PrismaClient | Prisma.TransactionClient
): Promise<RankingSubmission> {
	const countTrack = trackRankings.length;
	const trackIds = trackRankings.map((track) => track.id);

	const previousRankings = await db.trackRanking.findMany({
		where: {
			userId,
			trackId: { in: trackIds },
		},
		distinct: ["trackId"],
		orderBy: {
			submission: { completedAt: "desc" },
		},
		select: { trackId: true, rank: true, artistId: true },
	});

	const prevRankingMap = new Map(
		previousRankings.map((ranking) => [ranking.trackId, ranking.rank])
	);

	const sessionCreateData = trackRankings.map((data) => {
		const previousRank = prevRankingMap.get(data.id);
		const rankChange =
			previousRank !== undefined && previousRank !== null
				? previousRank - data.ranking
				: null;
		const rankPercentile = data.ranking / countTrack;

		return {
			rank: data.ranking,
			trackId: data.id,
			artistId: trackRankings[0].artistId,
			userId,
			rankPercentile,
			rankChange,
		};
	});

	const submission = await prisma.rankingSubmission.create({
        data: {
            userId,
            artistId: trackRankings[0].artistId,
            albumId,
            type,
            status: "COMPLETED",
            completedAt: new Date(),
            trackRanks: { createMany: { data: sessionCreateData } },
        },
    });

    return submission;
}
