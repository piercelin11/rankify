import { db } from "@/lib/prisma";
import { getPastDate, getPastDateProps } from "@/lib/utils/helper";
import { TimeFilterType } from "../ranking/overview/getTracksStats";
//import { unstable_cacheTag as cacheTag } from "next/cache";

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
	//"use cache";
	//cacheTag("user-data");

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
