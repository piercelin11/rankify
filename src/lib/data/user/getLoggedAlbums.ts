import { db } from "@/lib/prisma";
import { getPastDate, getPastDateProps } from "@/lib/utils/helper";
import { unstable_cacheTag as cacheTag } from "next/cache";

type getLoggedAlbumsProps = {
	artistId: string;
	userId: string;
	time?: getPastDateProps;
};

export default async function getLoggedAlbums({
	artistId,
	userId,
	time,
}: getLoggedAlbumsProps) {
	"use cache";
	cacheTag("user-data");

	const dateThreshold = time && getPastDate(time);
	const albums = await db.album.findMany({
		where: {
			artistId,
			tracks: {
				some: {
					rankings: {
						some: {
							userId,
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
								date: {
									gte: dateThreshold,
								},
							},
						},
					},
				},
			},
			artist: true,
		},
	});

	return albums;
}
