import { AlbumStat, Prisma } from "@prisma/client";
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
//TODO: 確認submissioncount的意義與計算是否正確。
//TODO: Claude Code reivew。

/**
 * [重構版] 更新使用者對某藝人的所有專輯統計
 *
 * 流程：
 * 1. 一次性讀取所有需要的 TrackStat、舊 AlbumStat 和提交次數。
 * 2. 在記憶體中計算所有專輯的絕對值（分數、百分位等）。
 * 3. 在記憶體中對計算結果進行排序。
 * 4. 在記憶體中根據排序結果，計算相對值（overallRank）。
 * 5. 一次性地將所有最終結果批次 upsert 到資料庫。
 */
export async function updateAlbumStats(
	tx: Prisma.TransactionClient,
	userId: string,
	artistId: string
) {
	// 1️⃣ [讀取] 一次性取得所有需要的資料
	const [trackStats, existingStats, albumSubmissionCounts] = await Promise.all([
		tx.trackStat.findMany({
			where: { userId, artistId },
			include: { track: { select: { id: true, albumId: true } } },
		}),
		tx.albumStat.findMany({ where: { userId, artistId } }),
		tx.albumRanking.groupBy({
			by: ["albumId"],
			where: { userId, artistId },
			_count: { albumId: true },
		}),
	]);
	const existingStatsMap = new Map(
		existingStats.map((stat) => [stat.albumId, stat])
	);
	const submissionCountMap = new Map(
		albumSubmissionCounts.map((item) => [
			item.albumId,
			item._count.albumId ?? 0,
		])
	);

	if (trackStats.length === 0) return;

	// 2️⃣ [記憶體計算] 計算所有「絕對值」
	const virtualRankings = trackStats
		.filter((stat) => stat.track.albumId)
		.map((stat) => ({
			id: stat.track.id,
			albumId: stat.track.albumId!,
			rank: stat.overallRank,
		}));

	if (virtualRankings.length === 0) return;

	const albumPoints = calculateAlbumPoints(virtualRankings);
	const percentileCounts = calculatePercentileCounts(
		trackStats,
		trackStats.length
	);

	const newStatsData: Omit<AlbumStat, "id" | "createdAt" | "updatedAt">[] = [];

	for (const albumData of albumPoints) {
		const albumTracks = trackStats.filter(
			(t) => t.track.albumId === albumData.albumId
		);
		if (albumTracks.length === 0) continue;

		const avgTrackRank = mean(albumTracks.map((t) => t.overallRank));
		const submissionCount = submissionCountMap.get(albumData.albumId) ?? 0;

		newStatsData.push({
			userId,
			artistId,
			albumId: albumData.albumId,
			points: albumData.points,
			averageTrackRank: avgTrackRank,
			trackCount: albumTracks.length,
			submissionCount,
			...(percentileCounts[albumData.albumId] ?? {
				top5PercentCount: 0,
				top10PercentCount: 0,
				top25PercentCount: 0,
				top50PercentCount: 0,
			}),
			// 佔位符，稍後在記憶體中計算
			overallRank: 0,
			previousOverallRank: null,
			overallRankChange: null,
			previousPoints: null,
			pointsChange: null,
		});
	}

	// 3️⃣ [記憶體排序] 根據分數對專輯進行排序
	newStatsData.sort((a, b) => b.points - a.points);

	// 4️⃣ [準備寫入] 遍歷排序後的陣列，計算「相對值」，並準備 upsert 操作
	const upsertPromises: Prisma.PrismaPromise<AlbumStat>[] = [];

	newStatsData.forEach((stat, index) => {
		const newRank = index + 1;
		const oldStats = existingStatsMap.get(stat.albumId);
		const previousOverallRank = oldStats?.overallRank ?? null;
		const previousPoints = oldStats?.points ?? null;

		const { userId, artistId, albumId, ...rest } = stat;

		const dataPayload: Prisma.AlbumStatCreateInput = {
			...rest,
			overallRank: newRank,
			previousOverallRank,
			overallRankChange: previousOverallRank
				? previousOverallRank - newRank
				: null,
			previousPoints,
			pointsChange: previousPoints ? stat.points - previousPoints : null,
			// 確保關聯欄位正確
			user: { connect: { id: userId } },
			artist: { connect: { id: artistId } },
			album: { connect: { id: albumId } },
		};

		upsertPromises.push(
			tx.albumStat.upsert({
				where: { userId_albumId: { userId, albumId: stat.albumId } },
				create: dataPayload,
				update: dataPayload,
			})
		);
	});

	// 5️⃣ [執行] 一次性地、並發地執行所有資料庫寫入操作
	if (upsertPromises.length > 0) {
		await Promise.all(upsertPromises);
	}
}

function calculatePercentileCounts(
	trackStats: Array<{
		overallRank: number;
		track: { albumId: string | null };
	}>,
	totalTrackCount: number
) {
	if (totalTrackCount === 0) return {};
	const threshold5 = totalTrackCount * 0.05;
	const threshold10 = totalTrackCount * 0.1;
	const threshold25 = totalTrackCount * 0.25;
	const threshold50 = totalTrackCount * 0.5;

	const result: Record<
		string,
		{
			top5PercentCount: number;
			top10PercentCount: number;
			top25PercentCount: number;
			top50PercentCount: number;
		}
	> = {};

	for (const stat of trackStats) {
		if (!stat.track.albumId) continue;
		if (!result[stat.track.albumId]) {
			result[stat.track.albumId] = {
				top5PercentCount: 0,
				top10PercentCount: 0,
				top25PercentCount: 0,
				top50PercentCount: 0,
			};
		}
		const counts = result[stat.track.albumId];
		if (stat.overallRank <= threshold5) counts.top5PercentCount++;
		if (stat.overallRank <= threshold10) counts.top10PercentCount++;
		if (stat.overallRank <= threshold25) counts.top25PercentCount++;
		if (stat.overallRank <= threshold50) counts.top50PercentCount++;
	}
	return result;
}

function mean(numbers: number[]): number {
	if (numbers.length === 0) return 0;
	return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
