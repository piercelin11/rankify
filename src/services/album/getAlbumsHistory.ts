"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { AlbumHistoryType } from "@/types/album";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cacheTags";

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

export async function getAlbumsHistory({
	artistId,
	submissionId,
	userId,
}: getAlbumsRankingHistoryProps): Promise<AlbumHistoryType[]> {
	cacheLife(CACHE_TIMES.LONG);
	cacheTag(CACHE_TAGS.RANKING(userId, artistId));

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
			points: "desc",
		},
	});

	if (albumRanking.length === 0) notFound();

	const percentileData = await db.trackRanking.findMany({
		where: {
			artistId,
			submissionId,
			userId,
			submission: { status: "COMPLETED" },
			track: {
				albumId: {
					not: null,
				},
			},
		},
		select: {
			rank: true,
			rankPercentile: true,
			track: {
				select: {
					id: true,
					name: true,
					albumId: true,
				},
			},
		},
	});

	const top5PercentMap = new Map<string, number>();
	const top10PercentMap = new Map<string, number>();
	const top25PercentMap = new Map<string, number>();
	const top50PercentMap = new Map<string, number>();
	const tracksByAlbumId = new Map<
		string,
		{ id: string; name: string; rank: number }[]
	>();

	percentileData.forEach((item) => {
		const albumId = item.track.albumId;
		if (!albumId) return;

		const list = tracksByAlbumId.get(albumId) ?? [];
		list.push({ id: item.track.id, name: item.track.name, rank: item.rank });
		tracksByAlbumId.set(albumId, list);

		if (item.rankPercentile <= 0.5) {
			const top50Count = top50PercentMap.get(albumId) || 0;
			top50PercentMap.set(albumId, top50Count + 1);
		}
		if (item.rankPercentile <= 0.25) {
			const top25Count = top25PercentMap.get(albumId) || 0;
			top25PercentMap.set(albumId, top25Count + 1);
		}
		if (item.rankPercentile <= 0.1) {
			const top10Count = top10PercentMap.get(albumId) || 0;
			top10PercentMap.set(albumId, top10Count + 1);
		}
		if (item.rankPercentile <= 0.05) {
			const top5Count = top5PercentMap.get(albumId) || 0;
			top5PercentMap.set(albumId, top5Count + 1);
		}
	});

	for (const list of tracksByAlbumId.values()) {
		list.sort((a, b) => a.rank - b.rank);
	}

	const currentDate = albumRanking[0].submission.createdAt;

	const prevSubmission = await db.rankingSubmission.findFirst({
		where: {
			artistId,
			userId,
			createdAt: { lt: currentDate },
			type: "ARTIST",
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
			// RankingSubmission 欄位
			submissionId,
			createdAt: data.submission?.createdAt || new Date(),
			// 計算欄位
			trackCount: tracksByAlbumId.get(data.albumId)?.length ?? 0,
			top5PercentCount: top5PercentMap.get(data.albumId) ?? 0,
			top10PercentCount: top10PercentMap.get(data.albumId) ?? 0,
			top25PercentCount: top25PercentMap.get(data.albumId) ?? 0,
			top50PercentCount: top50PercentMap.get(data.albumId) ?? 0,
			previousTotalPoints: prevPoints,
			pointsChange: calculatePointsChange(data.points, prevPoints),
			tracks: tracksByAlbumId.get(data.albumId) ?? [],
		};
	});

	return result;
}
