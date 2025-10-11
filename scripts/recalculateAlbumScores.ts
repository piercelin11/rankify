import { db } from "@/db/client";
//TODO: Claude Code reivew。

/**
 * 重新計算所有 AlbumRanking 和 AlbumStats
 *
 * 使用時機：
 * - 修改 calculateAlbumPoints 的計算邏輯後
 * - 需要統一更新所有歷史分數
 * - 資料修復（發現 AlbumStats 不正確）
 *
 * 執行方式：
 * npx tsx scripts/recalculateAlbumScores.ts
 *
 * ⚠️ 注意：
 * - 此腳本會修改資料庫資料，建議先備份
 * - 執行時間取決於資料量（可能需要數分鐘）
 */
async function recalculateAll() {
    console.log("🚀 開始重新計算所有 AlbumRanking 和 AlbumStats...\n");

    // ========== Step 1: 重新計算所有 AlbumRanking ==========
    console.log("📊 Step 1: 重新計算 AlbumRanking（基於 TrackRanking）");

    const allSubmissions = await db.rankingSubmission.findMany({
        where: {
            type: "ARTIST",
            status: "COMPLETED",
        },
        select: {
            id: true,
            artistId: true,
            userId: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    console.log(`   ✅ 找到 ${allSubmissions.length} 個已完成的提交\n`);

    let albumRankingUpdated = 0;
    let albumRankingErrors = 0;

    for (const submission of allSubmissions) {
        try {
            // 查詢該次提交的所有 TrackRanking
            const trackRankings = await db.trackRanking.findMany({
                where: { submissionId: submission.id },
                select: {
                    trackId: true,
                    rank: true,
                },
            });

            if (trackRankings.length === 0) {
                console.log(
                    `   ⏭️  跳過 submission ${submission.id}（無 TrackRanking）`
                );
                continue;
            }

            // 動態導入 calculateAlbumPoints（避免 import 路徑問題）
            const { calculateAlbumPoints } = await import(
                "@/features/ranking/utils/calculateAlbumPoints"
            );

            // 重新計算專輯分數（使用與 completeSubmission 相同的邏輯）
            const newAlbumPoints = calculateAlbumPoints(
                trackRankings.map((r) => ({
                    ...r,
                    ranking: r.rank,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                })) as any
            );

            // 更新資料庫中的 AlbumRanking
            for (const [index, album] of newAlbumPoints.entries()) {
                await db.albumRanking.updateMany({
                    where: {
                        submissionId: submission.id,
                        albumId: album.albumId,
                    },
                    data: {
                        rank: index + 1,
                        points: album.points,
                        averageTrackRank: album.averageTrackRanking,
                    },
                });
                albumRankingUpdated++;
            }

            // 每 10 個 submission 顯示一次進度
            if (allSubmissions.indexOf(submission) % 10 === 0) {
                console.log(
                    `   📈 進度: ${allSubmissions.indexOf(submission)}/${allSubmissions.length} (已更新 ${albumRankingUpdated} 筆)`
                );
            }
        } catch (error) {
            albumRankingErrors++;
            console.error(
                `   ❌ 錯誤 submission ${submission.id}:`,
                error instanceof Error ? error.message : error
            );
        }
    }

    console.log(
        `\n✅ AlbumRanking 重新計算完成: ${albumRankingUpdated} 筆更新, ${albumRankingErrors} 筆錯誤\n`
    );

    // ========== Step 2: 重新計算所有 AlbumStats ==========
    console.log("📊 Step 2: 重新計算 AlbumStats（基於 TrackStats）");
    console.log(
        "   ⚠️  此步驟需要先完成 Phase 2（實作 updateAlbumStats）才能執行"
    );
    console.log("   ⚠️  暫時跳過此步驟...\n");

    let albumStatsUpdated = 0;
    let albumStatsErrors = 0;

    // TODO: Phase 2 完成後，取消註解以下程式碼
    
    // 動態導入 updateAlbumStats
    const { updateAlbumStats } = await import(
        "@/services/album/updateAlbumStats"
    );

    // 取得所有有 TrackStats 的使用者
    const allUsers = await db.user.findMany({
        where: {
            trackStats: {
                some: {},
            },
        },
        select: { id: true, name: true },
    });

    console.log(`   ✅ 找到 ${allUsers.length} 個使用者\n`);

    // 取得所有藝人
    const allArtists = await db.artist.findMany({
        select: { id: true, name: true },
    });

    console.log(`   ✅ 找到 ${allArtists.length} 個藝人\n`);

    for (const user of allUsers) {
        for (const artist of allArtists) {
            try {
                // 檢查該使用者是否有該藝人的 TrackStats
                const trackStatsCount = await db.trackStat.count({
                    where: {
                        userId: user.id,
                        artistId: artist.id,
                    },
                });

                if (trackStatsCount === 0) {
                    continue; // 跳過沒有資料的組合
                }

                // 使用 transaction 更新 AlbumStats
                await db.$transaction(async (tx) => {
                    await updateAlbumStats(tx, user.id, artist.id);
                });

                albumStatsUpdated++;

                // 每 5 個組合顯示一次進度
                if (albumStatsUpdated % 5 === 0) {
                    console.log(
                        `   📈 進度: 已更新 ${albumStatsUpdated} 個 user×artist 組合`
                    );
                }
            } catch (error) {
                albumStatsErrors++;
                console.error(
                    `   ❌ 錯誤 ${user.name} × ${artist.name}:`,
                    error instanceof Error ? error.message : error
                );
            }
        }
    }

    console.log(
        `\n✅ AlbumStats 重新計算完成: ${albumStatsUpdated} 個組合更新, ${albumStatsErrors} 筆錯誤\n`
    );
    

    // ========== 最終總結 ==========
    console.log("=".repeat(50));
    console.log("✅ 所有重新計算完成！");
    console.log(`   AlbumRanking: ${albumRankingUpdated} 筆更新`);
    console.log(`   AlbumStats: ${albumStatsUpdated} 個 user×artist 組合`);
    console.log(
        `   錯誤: ${albumRankingErrors + albumStatsErrors} 筆（詳見上方錯誤訊息）`
    );
    console.log("=".repeat(50));
}

// 執行腳本
recalculateAll()
    .then(() => {
        console.log("\n✅ 腳本執行完成");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ 腳本執行失敗:", error);
        process.exit(1);
    })
    .finally(() => {
        db.$disconnect();
    });
