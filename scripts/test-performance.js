// 簡化版本，使用 CommonJS
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPerformance() {
  try {
    console.log('🧪 開始效能測試...');

    // 找測試數據
    const testData = await prisma.ranking.findFirst({
      select: { userId: true, artistId: true },
    });

    if (!testData) {
      console.log('❌ 沒有測試數據');
      return;
    }

    const { userId, artistId } = testData;
    console.log(`測試用戶: ${userId}, 歌手: ${artistId}`);

    // 測試基本查詢效能
    const start = Date.now();

    const rankings = await prisma.ranking.findMany({
      where: { userId, artistId },
      include: {
        track: {
          include: {
            album: { select: { name: true, color: true }}
          }
        }
      }
    });

    const end = Date.now();
    console.log(`⏱️  查詢 ${rankings.length} 筆 ranking 記錄: ${end - start}ms`);

    // 測試聚合查詢
    const aggStart = Date.now();

    const trackStats = await prisma.ranking.groupBy({
      by: ['trackId'],
      where: { userId, artistId },
      _min: { ranking: true },
      _max: { ranking: true },
      _avg: { ranking: true },
      _count: { _all: true }
    });

    const aggEnd = Date.now();
    console.log(`⏱️  聚合 ${trackStats.length} 首歌統計: ${aggEnd - aggStart}ms`);

    console.log(`\n🎯 總時間預估: ${(end - start) + (aggEnd - aggStart)}ms`);

    if ((end - start) + (aggEnd - aggStart) > 2000) {
      console.log('🔴 效能較慢，建議使用 TrackStatistics');
    } else if ((end - start) + (aggEnd - aggStart) > 1000) {
      console.log('🟡 效能中等，可考慮 TrackStatistics');
    } else {
      console.log('🟢 效能良好，暫不需要 TrackStatistics');
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPerformance();