import { TimeFilterType } from "../ranking/overview/getTracksStats";
import { db } from "@/lib/prisma";

type getLoggedTracksProps = {
	artistId: string;
	userId: string;
	time?: TimeFilterType;
};

export default async function getLoggedTracks({
	artistId,
	userId,
	time,
}: getLoggedTracksProps) {
	const date = time
		? {
				date: {
					[time.filter]: time.threshold,
				},
			}
		: undefined;

	const tracks = await db.track.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
					date,
				},
			},
		},
		include: {
			album: true,
			artist: true,
		},
		orderBy: [
			{
				album: {
					releaseDate: "desc",
				},
			},
			{ trackNumber: "asc" },
		],
	});

	return tracks.sort((a, b) => {
		return (b.album ? 1 : 0) - (a.album ? 1 : 0) 
	});
}
