import { db } from "@/db/client";

export type AlbumRankingSeriesType = Map<
	string,
	{
		ranking: number;
		points: number;
		createdAt: Date;
		submissionId: string;
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
			tracks: {
				some: {
					trackRanks: {
						some: {
							userId,
						},
					},
				},
			},
		},
		select: {
			id: true,
			name: true,
			color: true,
			albumRankings: {
				where: {
					submission: { status: "COMPLETED" },
				},
				select: {
					submission: {
						select: { createdAt: true, id: true },
					},
					points: true,
					ranking: true,
				},
				orderBy: {
					submission: {
						createdAt: "asc",
					},
				},
			},
		},
	});

	for (const album of albumRanking) {
		const rankings = album.albumRankings.map((data) => ({
			ranking: data.ranking,
			points: data.points,
			createdAt: data.submission?.createdAt || new Date(),
			submissionId: data.submission?.id || "",
		}));
		result.set(album.id, rankings);
	}

	return result;
}
