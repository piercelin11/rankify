import { db } from "@/lib/prisma";
import { calculateAlbumPoints } from "../../ranking/utils/calculateAlbumPoints";
import { AlbumRanking, Prisma } from "@prisma/client";
import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { PrismaClient } from "@prisma/client/extension";

type createAlbumRankingProps = {
	dateId: string;
	artistId: string;
	userId: string;
	trackRankings: RankingResultData[];
};

export default async function createAlbumRanking({
	dateId,
	artistId,
	userId,
	trackRankings,
}: createAlbumRankingProps, prisma: PrismaClient | Prisma.TransactionClient) {

	const albumStats = calculateAlbumPoints(trackRankings);
    const result: Omit<AlbumRanking, "id">[] = albumStats.map((stats, index) => ({
        dateId,
        artistId,
        userId,
        ranking: index + 1,
        albumId: stats.albumId,
        points: stats.points,
        basePoints: stats.basePoints,
        averageTrackRanking: stats.averageTrackRanking,
    }));

	try {
		await prisma.albumRanking.createMany({
			data: result,
		});
		console.log(`Success creating data of ${dateId}`);
	} catch (err) {
		console.error("Error creating album ranking:", err);
	}
}
