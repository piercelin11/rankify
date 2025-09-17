import { db } from "@/db/client";
import { $Enums, Prisma, RankingSession } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { RankingResultData } from "../../sorter/components/SortingStage";

type createRankingSessionProps = {
	trackRankings: RankingResultData[];
	userId: string;
	type: $Enums.RankingType;
};

export default async function createRankingSession(
	{ trackRankings, userId, type }: createRankingSessionProps,
	prisma: PrismaClient | Prisma.TransactionClient
): Promise<RankingSession> {
	const countTrack = trackRankings.length;
	const trackIds = trackRankings.map((track) => track.id);

	const previousRankings = await db.ranking.findMany({
		where: {
			userId,
			trackId: { in: trackIds },
		},
		distinct: ["trackId"],
		orderBy: {
			rankingSession: { date: "desc" },
		},
		select: { trackId: true, ranking: true, artistId: true },
	});

	const prevRankingMap = new Map(
		previousRankings.map((ranking) => [ranking.trackId, ranking.ranking])
	);

	const sessionCreateData = trackRankings.map((data) => {
		const previousRank = prevRankingMap.get(data.id);
		const rankChange =
			previousRank !== undefined && previousRank !== null
				? previousRank - data.ranking
				: null;
		const rankPercentile = data.ranking / countTrack;

		return {
			ranking: data.ranking,
			trackId: data.id,
			albumId: data.albumId,
			artistId: trackRankings[0].artistId,
			userId,
			rankPercentile,
			rankChange,
		};
	});

	const session = await prisma.rankingSession.create({
        data: {
            userId,
            artistId: trackRankings[0].artistId,
            type,
            rankings: { createMany: { data: sessionCreateData } },
        },
    });

    return session;
}
