import { db } from "@/lib/prisma";

type getLatestRankingSessionProps = {
	artistId: string;
	userId: string;
};

export default async function getLatestRankingSession({
	artistId,
	userId,
}: getLatestRankingSessionProps) {
	const latestSession = await db.rankingSession.findFirst({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
				},
			},
		},
		orderBy: {
			date: "desc",
		},
	});

	return latestSession;
}
