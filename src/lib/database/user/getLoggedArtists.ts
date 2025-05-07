import { db } from "@/lib/prisma";

type getLoggedArtistsProps = {
	userId: string;
};

export default async function getLoggedArtists({
	userId,
}: getLoggedArtistsProps) {

	const artists = await db.artist.findMany({
		where: {
			tracks: {
				some: {
					rankings: {
						some: {
							userId
						}
					}
				}
			}
		},
		include: {
			dates: {
				where: {
					userId
				}
			}
		}
	});

	return artists.sort((a, b) => b.dates.length - a.dates.length);
}
