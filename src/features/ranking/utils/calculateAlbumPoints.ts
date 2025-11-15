type TrackRankingsType = {albumId: string | null, rank: number}

export function calculateAlbumPoints(trackRankings: TrackRankingsType[]) {
	const result = [];
	const rankingsGroupedByAlbum = new Map<string, TrackRankingsType[]>();
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
		let rankSum = 0;

		for (const trackRanking of groupedRankings) {
			const points = calculateTrackPoints({
				trackRanking: trackRanking.rank,
				trackCount: trackRankings.length,
				albumTrackCount: groupedRankings.length,
				albumCount: rankingsGroupedByAlbum.size,
			});
			totalPoints += points;
			rankSum += trackRanking.rank;
		}

		result.push({albumId, points: totalPoints, averageTrackRanking: rankSum / groupedRankings.length });
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
}: calculateTrackPointsProps) {
	// 計算百分比排名
	const percentileRank =
		(trackCount - trackRanking + 1) / trackCount;
	// 計算分數
	const score =
		percentileRank > 0.75
			? percentileRank * 900
			: percentileRank > 0.5
				? percentileRank * 700
				: percentileRank > 0.25
					? percentileRank * 500
					: percentileRank * 400;
	// 短專輯懲罰：若專輯數小於5首且歌曲排名在前百分之五十，則引入平滑係數，防止曲目少的專輯僅靠一兩首神曲取勝
	const smoothingFactor =
		percentileRank > 0.5 && albumTrackCount < 5
			? albumTrackCount * 0.10 + 0.45
			: 1;
	// 長專輯懲罰：防止曲目多的專輯僅靠數量取勝
	const points = Math.floor((score / Math.pow(albumTrackCount, 0.8)) * smoothingFactor);

	return points;
}
