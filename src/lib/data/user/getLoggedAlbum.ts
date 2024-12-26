import { db } from "@/lib/prisma";
import { getPastDate, getPastDateProps } from "@/lib/utils/helper";

type getAlbumRankingsProps = {
	artistId: string;
	userId: string;
	time?: getPastDateProps;
};

export default async function getLoggedAlbum({artistId, userId, time}: getAlbumRankingsProps ) {
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
									gte: dateThreshold
								}
							}
						},
					},
				},
			},
			artist: true,
		},
	});

    return albums;
}
