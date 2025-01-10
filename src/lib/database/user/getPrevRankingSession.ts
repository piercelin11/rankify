import { db } from "@/lib/prisma";
import getLatestRankingSession from "./getLatestRankingSession";
//import { unstable_cacheTag as cacheTag } from "next/cache";

type getPrevRankingSessionProps = {
	artistId: string;
	userId: string;
	dateId: string;
};

export default async function getPrevRankingSession({
	artistId,
	userId,
	dateId,
}: getPrevRankingSessionProps) {
	const latestSession = await getLatestRankingSession({ artistId, userId });

	const previousRankingSessions = await db.rankingSession.findFirst({
		where: {
			artistId,
			userId,
			date: {
				lt: latestSession?.date,
			},
		},
		include: {
			artist: true,
			rankings: true,
		},
		orderBy: {
			date: "desc",
		},
	});

	return previousRankingSessions;
}
