import { db } from "@/db/client";

export type AlbumRankingSeriesType = Map<
	string,
	{
		ranking: number;
		points: number;
		date: Date;
		dateId: string;
	}[]
>;

type getAlbumRankingSeriesProps = {
	artistId: string;
	userId: string;
};

export default async function getAlbumRankingSeries({
	artistId,
	userId,
}: getAlbumRankingSeriesProps) {
	const result: AlbumRankingSeriesType = new Map();
	const albumRanking = await db.album.findMany({
		where: {
			artistId,
			rankings: {
				some: {
					userId,
				},
			},
		},
		select: {
			id: true,
			name: true,
			color: true,
			albumRankings: {
				select: {
					date: {
						select: { date: true, id: true },
					},
					points: true,
					ranking: true,
				},
				orderBy: {
					date: {
						date: "asc",
					},
				},
			},
		},
	});

	for (const album of albumRanking) {
		const rankings = album.albumRankings.map((data) => ({
			ranking: data.ranking,
			points: data.points,
			date: data.date.date,
			dateId: data.date.id,
		}));
		result.set(album.id, rankings);
	}

	return result;
}
