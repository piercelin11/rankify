import { calculateAlbumPoints } from "../utils/calculateAlbumPoints";
import { AlbumRanking, Prisma } from "@prisma/client";
import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { PrismaClient } from "@prisma/client/extension";

type createAlbumRankingProps = {
	submissionId: string;
	artistId: string;
	userId: string;
	trackRankings: RankingResultData[];
};

export default async function createAlbumRanking({
	submissionId,
	artistId,
	userId,
	trackRankings,
}: createAlbumRankingProps, prisma: PrismaClient | Prisma.TransactionClient) {

	const albumStats = calculateAlbumPoints(trackRankings);
    const result = albumStats.map((stats, index) => ({
        submissionId,
        artistId,
        userId,
        ranking: index + 1,
        albumId: stats.albumId,
        points: stats.points,
        basePoints: stats.basePoints,
        averageTrackRanking: stats.averageTrackRanking,
        // submissionId 已經包含在結構中，不需要額外的 dateId
    }));

	await prisma.albumRanking.createMany({
		data: result,
	});
}
