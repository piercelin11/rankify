import { db } from "@/lib/prisma";
import { TimeFilterType } from "../ranking/overview/getTracksStats";
import { getUserRankingPreference } from "./getUserPreference";

type getLoggedAlbumsProps = {
	artistId: string;
	userId: string;
	time?: TimeFilterType;
};

export default async function getLoggedAlbums({
	artistId,
	userId,
	time,
}: getLoggedAlbumsProps) {
	const trackConditions = await getUserRankingPreference({userId});
	const date = time
		? {
				date: {
					[time.filter]: time.threshold,
				},
			}
		: undefined;

	const albums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					rankings: {
						some: {
							userId,
							date,
						},
					},
				},
			},
		},
		include: {
			tracks: {
				where: {
					rankings: {
						some: {
							userId,
							date,
						},
					},
					...trackConditions
				},
			},
			artist: true,
		},
		orderBy: {
			releaseDate: "desc",
		},
	});

	return albums;
}
