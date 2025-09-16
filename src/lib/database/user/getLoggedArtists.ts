import { db } from "@/db/client";

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
			rankingSessions: {
				where: {
					userId
				}
			}
		}
	});

	return artists.sort((a, b) => b.rankingSessions.length - a.rankingSessions.length);
}
