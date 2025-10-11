import { db } from "@/db/client";
import { updateAlbumStats } from "@/services/album/updateAlbumStats";

/**
 * 回填所有使用者的 AlbumStats
 *
 * 執行時機：
 * - 首次部署 AlbumStats 功能時
 * - 資料庫 migration 完成後
 *
 * 執行方式：
 * npx tsx scripts/backfillAlbumStats.ts
 */
async function backfillAlbumStats() {
    console.log("🔍 正在查詢所有有完成提交的使用者...\n");

    // 取得所有有完成提交的使用者
    const usersWithSubmissions = await db.user.findMany({
        where: {
            submissions: {
                some: {
                    status: "COMPLETED",
                    type: "ARTIST",
                },
            },
        },
        select: { id: true, name: true },
    });

    console.log(`✅ 找到 ${usersWithSubmissions.length} 個使用者\n`);

    // 取得所有藝人
    const artists = await db.artist.findMany({
        select: { id: true, name: true },
    });

    console.log(`✅ 找到 ${artists.length} 個藝人\n`);

    let processedCount = 0;
    let errorCount = 0;

    // 為每個使用者 × 藝人組合建立 AlbumStats
    for (const user of usersWithSubmissions) {
        for (const artist of artists) {
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

                console.log(`📊 處理中: ${user.name} × ${artist.name}...`);

                await db.$transaction(async (tx) => {
                    await updateAlbumStats(tx, user.id, artist.id);
                });

                processedCount++;
                console.log(`   ✅ 成功 (總計 ${processedCount} 個組合)\n`);
            } catch (error) {
                errorCount++;
                console.error(
                    `   ❌ 錯誤 ${user.name} × ${artist.name}:`,
                    error instanceof Error ? error.message : error
                );
            }
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ 回填完成！`);
    console.log(`   成功處理: ${processedCount} 個 user×artist 組合`);
    console.log(`   錯誤: ${errorCount} 個`);
    console.log("=".repeat(50));
}

backfillAlbumStats()
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
