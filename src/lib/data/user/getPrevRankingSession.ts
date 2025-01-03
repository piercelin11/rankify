import { db } from "@/lib/prisma";
import { unstable_cacheTag as cacheTag } from "next/cache";

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
	"use cache";
	cacheTag("user-data");
    
	const previousRankingSessions = await db.rankingSession.findFirst({
		where: {
			artistId,
			userId,
			date: {
				lt: (await db.rankingSession.findFirst({ where: { id: dateId } }))
					?.date,
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
