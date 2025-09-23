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
					trackRanks: {
						some: {
							userId
						}
					}
				}
			}
		},
		include: {
			submissions: {
				where: {
					userId,
					status: "COMPLETED"
				}
			}
		}
	});

	return artists.sort((a, b) => b.submissions.length - a.submissions.length);
}
