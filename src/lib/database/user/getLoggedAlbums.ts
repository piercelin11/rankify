import { db } from "@/lib/prisma";
import { getPastDate, getPastDateProps } from "@/lib/utils/helper";
//import { unstable_cacheTag as cacheTag } from "next/cache";

type getLoggedAlbumsProps = {
	artistId: string;
	userId: string;
	date?: Date;
};

export default async function getLoggedAlbums({
	artistId,
	userId,
	date,
}: getLoggedAlbumsProps) {
	//"use cache";
	//cacheTag("user-data");

	const albums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					rankings: {
						some: {
							userId,
							date: {
								date
							},
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
							date: {
								date
							},
						},
					},
				},
			},
			artist: true,
		},
		orderBy: {
			releaseDate: "desc"
		}
	});

	return albums;
}