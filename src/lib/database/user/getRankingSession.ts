import { db } from "@/db/client";
import { TimeFilterType } from "../ranking/overview/getTracksStats";

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
		/* include: {
			artist: true,
			rankings: true,
		}, */
		orderBy: {
			date: "desc",
		},
	});

	return rankingSessions;
}

type getRankingSessionByIdProps = {
	dateId: string;
};

export async function getRankingSessionById({
	dateId
}: getRankingSessionByIdProps) {

	const rankingSessions = await db.rankingSession.findFirst({
		where: {
			id: dateId,
		},
		/* include: {
			artist: true,
			rankings: true,
		}, */
		orderBy: {
			date: "desc",
		},
	});

	return rankingSessions;
}
