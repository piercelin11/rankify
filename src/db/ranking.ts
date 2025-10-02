import { $Enums } from "@prisma/client";
import { db } from "./client";

export async function getPeakRankings(
	peak: number,
	trackId: string,
	userId: string
) {
	const peakRankings = await db.trackRanking.findMany({
		where: {
			trackId,
			rank: peak,
			userId,
		},
		include: {
			submission: {
				select: {
					createdAt: true,
				},
			},
		},
		orderBy: {
			submission: {
				createdAt: "asc",
			},
		},
	});

	return peakRankings.map((ranking) => ({
		...ranking,
		date: ranking.submission.createdAt,
		ranking: ranking.rank, // 保持向後相容的字段名
	}));
}

export async function getLatestArtistRankingSubmissions(
	artistId: string,
	userId: string
) {
	const latestSubmission = await db.rankingSubmission.findFirst({
		where: {
			artistId,
			userId,
			type: "ARTIST",
			status: "COMPLETED",
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			createdAt: true,
		},
	});

	return latestSubmission
		? {
				id: latestSubmission.id,
				date: latestSubmission.createdAt,
			}
		: null;
}

export async function getArtistRankingSubmissions(
	artistId: string,
	userId: string
) {
	const submissions = await db.rankingSubmission.findMany({
		where: {
			artistId,
			userId,
			type: "ARTIST",
			status: "COMPLETED",
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			createdAt: true,
		},
	});

	return submissions.map((submission) => ({
		id: submission.id,
		date: submission.createdAt,
	}));
}

export async function getIncomleteRankingSubmission(
	artistId: string,
	userId: string,
	type: $Enums.SubmissionType = "ARTIST",
	albumId?: string
) {
	const submissions = await db.rankingSubmission.findMany({
		where: {
			artistId,
			userId,
			type,
			status: { not: "COMPLETED" },
			albumId,
		},
	});

	if (submissions.length > 1) throw new Error("More than one submission found");

	return submissions[0];
}
