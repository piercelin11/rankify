import { cache } from "react";
import { db } from "@/db/client";
import { TrackStatsType } from "@/types/track";

type getTracksStatsProps = {
	artistId: string;
	userId: string;
	take?: number;
};

async function getPercentileCounts(trackIds: string[]) {
	const results = await db.trackRanking.findMany({
		where: {
			trackId: { in: trackIds },
			submission: { type: "ARTIST", status: "COMPLETED" },
		},
		select: {
			trackId: true,
			rankPercentile: true,
		},
	});

	return trackIds.reduce(
		(acc, trackId) => {
			const trackRankings = results.filter((r) => r.trackId === trackId);
			acc[trackId] = {
				top50: trackRankings.filter((r) => r.rankPercentile <= 0.5).length,
				top25: trackRankings.filter((r) => r.rankPercentile <= 0.25).length,
				top5: trackRankings.filter((r) => r.rankPercentile <= 0.05).length,
			};
			return acc;
		},
		{} as Record<string, { top50: number; top25: number; top5: number }>
	);
}

const getTracksStats = cache(
	async ({
		artistId,
		userId,
	}: getTracksStatsProps): Promise<TrackStatsType[]> => {
		const trackStats = await db.trackStat.findMany({
			where: {
				artistId,
				userId,
			},
			select: {
				// TrackStat 欄位
				overallRank: true,
				highestRank: true,
				lowestRank: true,
				averageRank: true,
				cumulativeRankChange: true,
				submissionCount: true,
				hotStreak: true,
				coldStreak: true,
				overallRankChange: true,
				// Track 關聯
				track: {
					select: {
						id: true,
						name: true,
						artistId: true,
						albumId: true,
						img: true,
						color: true,
						trackNumber: true,
						discNumber: true,
						type: true,
						releaseDate: true,
						spotifyUrl: true,
						album: {
							select: {
								name: true,
								color: true,
							},
						},
					},
				},
			},
			orderBy: {
				overallRank: "asc",
			},
		});

		const trackIds = trackStats.map((stats) => stats.track.id);
		const percentileCounts = await getPercentileCounts(trackIds);

		const result: TrackStatsType[] = trackStats.map((data) => {
			const counts = percentileCounts[data.track.id] || {
				top50: 0,
				top25: 0,
				top5: 0,
			};

			return {
				// Track Model 欄位
				id: data.track.id,
				name: data.track.name,
				artistId: data.track.artistId,
				albumId: data.track.albumId,
				img: data.track.img,
				color: data.track.color,
				trackNumber: data.track.trackNumber,
				discNumber: data.track.discNumber,
				type: data.track.type,
				releaseDate: data.track.releaseDate,
				spotifyUrl: data.track.spotifyUrl,
				// TrackStat Model 欄位
				overallRank: data.overallRank,
				highestRank: data.highestRank,
				lowestRank: data.lowestRank,
				averageRank: data.averageRank,
				cumulativeRankChange: data.cumulativeRankChange,
				submissionCount: data.submissionCount,
				hotStreak: data.hotStreak,
				coldStreak: data.coldStreak,
				overallRankChange: data.overallRankChange,
				// 計算欄位
				rank: data.overallRank,
				gap: data.lowestRank - data.highestRank,
				top50PercentCount: counts.top50,
				top25PercentCount: counts.top25,
				top5PercentCount: counts.top5,
				// 關聯資料
				album: {
					name: data.track.album?.name ?? null,
					color: data.track.album?.color ?? null,
				},
			};
		});

		return result;
	}
);

export default getTracksStats;
