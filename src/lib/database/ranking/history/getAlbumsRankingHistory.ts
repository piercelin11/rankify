import { AlbumData } from "@/types/data";
import { db } from "@/db/client";

export type AlbumHistoryType = Omit<AlbumData, "tracks"> & {
	submissionId: string;
	createdAt: Date;
	rank: number;
	top25PercentCount: number;
	top50PercentCount: number;
	totalPoints: number;
	totalBasePoints: number;
	previousTotalPoints?: number;
	pointsChange?: number | null;
};

type getAlbumsRankingHistoryOptions = {
	includeChange?: boolean;
};

type getAlbumsRankingHistoryProps = {
	artistId: string;
	userId: string;
	submissionId: string;
	options?: getAlbumsRankingHistoryOptions;
};

const defaultOptions = {
	includeChange: false,
};

export async function getAlbumsRankingHistory({
	artistId,
	submissionId,
	userId,
	options = defaultOptions,
}: getAlbumsRankingHistoryProps): Promise<AlbumHistoryType[]> {
	const albumRanking = await db.albumRanking.findMany({
		where: {
			artistId,
			submissionId,
			userId,
			submission: { status: "COMPLETED" },
		},
		include: {
			album: true,
			submission: {
				select: {
					createdAt: true,
				},
			},
		},
	});

	const top25PercentData = await db.trackRanking.findMany({
		where: {
			artistId,
			submissionId,
			userId,
			rankPercentile: { lte: 0.25 },
			submission: { status: "COMPLETED" },
			track: {
				albumId: {
					not: null,
				},
			},
		},
		include: {
			track: {
				select: {
					albumId: true,
				},
			},
		},
	});

	const top25PercentMap = new Map<string, number>();
	top25PercentData.forEach((item) => {
		if (item.track.albumId) {
			const current = top25PercentMap.get(item.track.albumId) || 0;
			top25PercentMap.set(item.track.albumId, current + 1);
		}
	});

	const top50PercentData = await db.trackRanking.findMany({
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
		include: {
			track: {
				select: {
					albumId: true,
				},
			},
		},
	});

	const top50PercentMap = new Map<string, number>();
	top50PercentData.forEach((item) => {
		if (item.track.albumId) {
			const current = top50PercentMap.get(item.track.albumId) || 0;
			top50PercentMap.set(item.track.albumId, current + 1);
		}
	});

	let prevPointsMap: Map<string, number> | undefined;

	if (options.includeChange) {
		const currentDate = albumRanking[0].submission?.createdAt;

		const prevSubmissionId = (
			await db.rankingSubmission.findFirst({
				where: {
					artistId,
					userId,
					createdAt: {
						lt: currentDate,
					},
					status: "COMPLETED",
				},
				orderBy: {
					createdAt: "desc",
				},
			})
		)?.id;

		if (prevSubmissionId) {
			const prevAlbumRanking = await db.albumRanking.findMany({
				where: {
					artistId,
					submissionId: prevSubmissionId,
					userId,
					submission: { status: "COMPLETED" },
				},
				select: {
					albumId: true,
					points: true,
				},
			});

			prevPointsMap = new Map(
				prevAlbumRanking.map((album) => [album.albumId, album.points])
			);
		}
	}

	const result = albumRanking.map((data) => {
		const prevPoints = options.includeChange
			? prevPointsMap?.get(data.albumId)
			: undefined;
		const pointsChange =
			options.includeChange && prevPoints != null
				? data.points - prevPoints
				: null;

		return {
			...data.album,
			submissionId,
			createdAt: data.submission?.createdAt || new Date(),
			rank: data.rank,
			top25PercentCount: top25PercentMap.get(data.albumId) ?? 0,
			top50PercentCount: top50PercentMap.get(data.albumId) ?? 0,
			totalPoints: data.points,
			totalBasePoints: data.basePoints,
			previousTotalPoints: prevPointsMap?.get(data.albumId),
			pointsChange: pointsChange,
		};
	});

	return result.sort((a, b) => b.totalPoints - a.totalPoints);
}
