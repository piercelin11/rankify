import { cache } from "react";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { AlbumHistoryType } from "@/types/album";

type getAlbumsRankingHistoryProps = {
	artistId: string;
	userId: string;
	submissionId: string;
};

function calculatePointsChange(
	current: number,
	previous: number | undefined
): number | null {
	return previous != null ? current - previous : null;
}

export const getAlbumsHistory = cache(async ({
	artistId,
	submissionId,
	userId,
}: getAlbumsRankingHistoryProps): Promise<AlbumHistoryType[]> => {
	const albumRanking = await db.albumRanking.findMany({
		where: {
			artistId,
			submissionId,
			userId,
			submission: { status: "COMPLETED" },
		},
		select: {
			albumId: true,
			rank: true,
			points: true,
			basePoints: true,
			album: {
				select: {
					id: true,
					name: true,
					artistId: true,
					spotifyUrl: true,
					color: true,
					img: true,
					releaseDate: true,
					type: true,
				},
			},
			submission: {
				select: {
					createdAt: true,
				},
			},
		},
		orderBy: {
			rank: "asc",
		},
	});

	if (albumRanking.length === 0) notFound();

	const percentileData = await db.trackRanking.findMany({
		where: {
			artistId,
			submissionId,
			userId,
			rankPercentile: { lte: 0.5 },
			submission: { status: "COMPLETED" },
			track: {
				albumId: {
					not: null,
				},
			},
		},
		select: {
			rankPercentile: true,
			track: {
				select: {
					albumId: true,
				},
			},
		},
	});

	const top25PercentMap = new Map<string, number>();
	const top50PercentMap = new Map<string, number>();

	percentileData.forEach((item) => {
		const albumId = item.track.albumId;
		if (!albumId) return;

		const top50Count = top50PercentMap.get(albumId) || 0;
		top50PercentMap.set(albumId, top50Count + 1);

		if (item.rankPercentile <= 0.25) {
			const top25Count = top25PercentMap.get(albumId) || 0;
			top25PercentMap.set(albumId, top25Count + 1);
		}
	});

	const currentDate = albumRanking[0].submission.createdAt;

	const prevSubmission = await db.rankingSubmission.findFirst({
		where: {
			artistId,
			userId,
			createdAt: { lt: currentDate },
			status: "COMPLETED",
		},
		orderBy: { createdAt: "desc" },
	});

	const prevPointsMap = new Map<string, number>(
		prevSubmission
			? (
					await db.albumRanking.findMany({
						where: {
							artistId,
							submissionId: prevSubmission.id,
							userId,
							submission: { status: "COMPLETED" },
						},
						select: {
							albumId: true,
							points: true,
						},
					})
				).map((album) => [album.albumId, album.points])
			: []
	);

	const result: AlbumHistoryType[] = albumRanking.map((data) => {
		const prevPoints = prevPointsMap.get(data.albumId);

		return {
			// Album Model 欄位
			id: data.album.id,
			name: data.album.name,
			artistId: data.album.artistId,
			spotifyUrl: data.album.spotifyUrl,
			color: data.album.color,
			img: data.album.img,
			releaseDate: data.album.releaseDate,
			type: data.album.type,
			// AlbumRanking 欄位
			rank: data.rank,
			totalPoints: data.points,
			totalBasePoints: data.basePoints,
			// RankingSubmission 欄位
			submissionId,
			createdAt: data.submission?.createdAt || new Date(),
			// 計算欄位
			top25PercentCount: top25PercentMap.get(data.albumId) ?? 0,
			top50PercentCount: top50PercentMap.get(data.albumId) ?? 0,
			previousTotalPoints: prevPoints,
			pointsChange: calculatePointsChange(data.points, prevPoints),
		};
	});

	return result;
});
