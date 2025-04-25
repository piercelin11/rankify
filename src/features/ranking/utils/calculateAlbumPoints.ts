import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { Ranking } from "@prisma/client";

export function calculateAlbumPoints(trackRankings: RankingResultData[]) {
	const result = [];
	const rankingsGroupedByAlbum = new Map<string, RankingResultData[]>();
	for (const ranking of trackRankings) {
		if (ranking.albumId) {
			if (!rankingsGroupedByAlbum.has(ranking.albumId)) {
				rankingsGroupedByAlbum.set(ranking.albumId, []);
			}
			rankingsGroupedByAlbum.get(ranking.albumId)!.push(ranking);
		}
	}
	for (const [albumId, groupedRankings] of rankingsGroupedByAlbum.entries()) {
		let totalPoints = 0;
		let totalBasePoints = 0;
		let rankSum = 0;

		for (const trackRanking of groupedRankings) {
			const { points, basePoints } = calculateTrackPoints({
				trackRanking: trackRanking.ranking,
				trackCount: trackRankings.length,
				albumTrackCount: groupedRankings.length,
				albumCount: rankingsGroupedByAlbum.size,
			});
			totalPoints += points;
			totalBasePoints += basePoints;
			rankSum += trackRanking.ranking;
		}

		result.push({albumId, points: totalPoints, basePoints: totalBasePoints, averageTrackRanking: rankSum / groupedRankings.length });
	}

	return result.sort((a, b) => a.averageTrackRanking - b.averageTrackRanking);
}

type calculateTrackPointsProps = {
	trackRanking: number;
	trackCount: number;
	albumTrackCount: number;
	albumCount: number;
};

function calculateTrackPoints({
	trackRanking,
	trackCount,
	albumTrackCount,
	albumCount,
}: calculateTrackPointsProps) {
	// 計算百分比排名
	const percentileRank =
		(trackCount - trackRanking + 1) / trackCount;
	// 計算分數
	let score =
		percentileRank > 0.75
			? percentileRank * 1000
			: percentileRank > 0.5
				? percentileRank * 950
				: percentileRank > 0.25
					? percentileRank * 650
					: percentileRank * 500;
	// 引入平滑係數：若專輯數小於5首且歌曲排名在前百分之五十，則引入平滑係數
	const smoothingFactor =
		percentileRank > 0.5 && albumTrackCount < 5
			? albumTrackCount * 0.15 + 0.25
			: 1;
	// 調整分數
	const points = Math.floor((score / albumTrackCount) * smoothingFactor);
	const basePoints = Math.floor(
		score / (trackCount / albumCount)
	);

	return { points, basePoints };
}
