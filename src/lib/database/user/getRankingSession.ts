import { db } from "@/lib/prisma";
import { TimeFilterType } from "../ranking/overview/getTracksStats";
//import { unstable_cacheTag as cacheTag } from "next/cache";

type getAlbumRankingsProps = {
	artistId: string;
	userId: string;
	time?: TimeFilterType;
};

export default async function getRankingSession({
	artistId,
	userId,
	time,
}: getAlbumRankingsProps) {
	const date = time
		? {
				[time.filter]: time.threshold,
			}
		: undefined;

	const rankingSessions = await db.rankingSession.findMany({
		where: {
			artistId,
			userId,
			date,
		},
		include: {
			artist: true,
			rankings: true,
		},
		orderBy: {
			date: "desc",
		},
	});

	return rankingSessions;
}
