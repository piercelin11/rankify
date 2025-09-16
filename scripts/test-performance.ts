import getTracksStats from "@/services/track/getTracksStats";
import { db } from "@/db/client";

async function testGetTracksStatsPerformance() {
  try {
    // 找一個有數據的用戶和歌手
    const testData = await db.ranking.findFirst({
      select: { userId: true, artistId: true },
      where: {
        artist: {
          rankings: {
            some: {}
          }
        }
      }
    });

    if (!testData) {
      console.log("❌ 沒有找到測試數據");
      return;
    }

    const { userId, artistId } = testData;

    console.log(`🧪 測試 getTracksStats 效能`);
    console.log(`用戶 ID: ${userId}`);
    console.log(`歌手 ID: ${artistId}`);
    console.log(`開始測試...\n`);

    // 測試 1: 完整統計
    console.time("getTracksStats-完整統計");
    const allTracks = await getTracksStats({
      artistId,
      userId
    });
    console.timeEnd("getTracksStats-完整統計");
    console.log(`📊 載入了 ${allTracks.length} 首歌的統計資料\n`);

    // 測試 2: 限制數量
    console.time("getTracksStats-限制50首");
    const limitedTracks = await getTracksStats({
      artistId,
      userId,
      take: 50
    });
    console.timeEnd("getTracksStats-限制50首");
    console.log(`📊 載入了 ${limitedTracks.length} 首歌的統計資料\n`);

    // 測試 3: 時間範圍過濾
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    console.time("getTracksStats-一年內資料");
    const recentTracks = await getTracksStats({
      artistId,
      userId,
      dateRange: { from: oneYearAgo }
    });
    console.timeEnd("getTracksStats-一年內資料");
    console.log(`📊 載入了 ${recentTracks.length} 首歌的統計資料\n`);

    // 分析結果
    console.log("🎯 效能分析:");
    if (allTracks.length < 100) {
      console.log("✅ 歌曲數量較少，可能不需要 TrackStatistics");
    } else if (allTracks.length > 500) {
      console.log("🔶 歌曲數量很多，建議考慮 TrackStatistics");
    } else {
      console.log("⚖️ 歌曲數量中等，視效能決定是否需要 TrackStatistics");
    }

  } catch (error) {
    console.error("❌ 測試過程中發生錯誤:", error);
  } finally {
    await db.$disconnect();
  }
}

// 執行測試
testGetTracksStatsPerformance();