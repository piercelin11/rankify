import { db } from "@/db/client";
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
import { updateAlbumStats } from "@/services/album/updateAlbumStats";
import { Prisma } from "@prisma/client";

/**
 * [邏輯修正版] 重新計算所有 AlbumRanking 和 AlbumStats
 *
 * 核心邏輯修正：
 * 1. AlbumRanking：採用更穩健的「先刪除後重建」邏輯，確保每次計算都是全新的、正確的結果。
 * 2. AlbumStats：直接查詢需要更新的 user×artist 組合，而不是遍歷所有可能性，避免中途出錯導致部分更新。
 */
async function recalculateAll() {
	console.log(
		"🚀 開始重新計算所有 AlbumRanking 和 AlbumStats (邏輯修正版)...\n"
	);

	const progressBar = (current: number, total: number, message: string) => {
		const percentage = ((current / total) * 100).toFixed(2);
		process.stdout.write(
			`\r   📈 ${message}: ${current}/${total} (${percentage}%)`
		);
	};

	// ========== Step 1: 穩健地重新計算 AlbumRanking ==========
	console.log("📊 Step 1: 穩健地重新計算 AlbumRanking...");

	const allSubmissions = await db.rankingSubmission.findMany({
		where: { type: "ARTIST", status: "COMPLETED" },
		select: { id: true, userId: true, artistId: true },
	});

	const allTrackRankings = await db.trackRanking.findMany({
		where: { submissionId: { in: allSubmissions.map((s) => s.id) } },
		select: {
			submissionId: true,
			track: { select: { id: true, albumId: true } },
			rank: true,
		},
	});

	const rankingsBySubmission = allTrackRankings.reduce(
		(acc, r) => {
			if (!acc[r.submissionId]) acc[r.submissionId] = [];
			acc[r.submissionId].push(r);
			return acc;
		},
		{} as Record<string, typeof allTrackRankings>
	);

	console.log(`   ✅ 找到 ${allSubmissions.length} 個提交\n`);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const transactionPromises: Prisma.PrismaPromise<any>[] = [];

	for (const submission of allSubmissions) {
		const trackRankings = rankingsBySubmission[submission.id];
		if (!trackRankings || trackRankings.length === 0) continue;

		// [邏輯修正] 採用「先刪除後重建」的模式
		// 1. 先刪除該 submissionId 下所有的舊 AlbumRanking 紀錄
		transactionPromises.push(
			db.albumRanking.deleteMany({
				where: { submissionId: submission.id },
			})
		);

		// 2. 重新計算專輯分數
		const newAlbumPoints = calculateAlbumPoints(
			trackRankings.map((r) => ({
				...r,
				rank: r.rank,
				id: r.track.id,
				albumId: r.track.albumId,
			}))
		);

		// 3. 準備 createMany，一次性插入所有新的、正確的 AlbumRanking 紀錄
		if (newAlbumPoints.length > 0) {
			transactionPromises.push(
				db.albumRanking.createMany({
					data: newAlbumPoints.map((album, index) => ({
						submissionId: submission.id,
						userId: submission.userId,
						artistId: submission.artistId,
						albumId: album.albumId,
						rank: index + 1,
						points: album.points,
						averageTrackRank: album.averageTrackRanking,
					})),
				})
			);
		}
		progressBar(
			allSubmissions.indexOf(submission) + 1,
			allSubmissions.length,
			"準備 Submission"
		);
	}

	try {
		console.log("\n   執行 AlbumRanking 更新交易...");
		await db.$transaction(transactionPromises);
		console.log(`\n✅ AlbumRanking 重新計算完成！\n`);
	} catch (error) {
		console.error("\n\n❌ AlbumRanking 更新失敗:", error);
	}

	// ========== Step 2: 準確地重新計算 AlbumStats ==========
	console.log("📊 Step 2: 準確地重新計算 AlbumStats...");

	// [邏輯修正] 直接查詢需要更新的 user × artist 組合
	const userArtistPairs = await db.trackStat.groupBy({
		by: ["userId", "artistId"],
	});

	console.log(
		`   ✅ 找到 ${userArtistPairs.length} 個需要更新的 user × artist 組合\n`
	);

	let albumStatsUpdated = 0;
	let albumStatsErrors = 0;

	for (const pair of userArtistPairs) {
		try {
			await db.$transaction(async (tx) => {
				await updateAlbumStats(tx, pair.userId, pair.artistId);
			});
			albumStatsUpdated++;
			progressBar(albumStatsUpdated, userArtistPairs.length, "更新 AlbumStats");
		} catch (error) {
			albumStatsErrors++;
			console.error(
				`\n   ❌ 錯誤 ${pair.userId} × ${pair.artistId}:`,
				error instanceof Error ? error.message : error
			);
		}
	}

	console.log(
		`\n\n✅ AlbumStats 重新計算完成: ${albumStatsUpdated} 個組合更新, ${albumStatsErrors} 筆錯誤\n`
	);

	// ... 最終總結 ...
	console.log("=".repeat(50));
	console.log("✅ 所有重新計算完成！");
	console.log(`   AlbumStats: ${albumStatsUpdated} 個 user×artist 組合`);
	console.log(`   錯誤總計: ${albumStatsErrors} 筆`);
	console.log("=".repeat(50));
}

// 執行腳本
recalculateAll()
	.catch((error) => {
		console.error("\n❌ 腳本執行時發生嚴重錯誤:", error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
		process.exit(0);
	});
