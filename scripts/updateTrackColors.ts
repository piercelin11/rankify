import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTrackColors() {
  console.log('開始更新 Track 的 color 欄位...');

  try {
    // 先查詢有 album 且 album 有 color 的 tracks
    const tracksWithAlbums = await prisma.track.findMany({
      where: {
        albumId: {
          not: null,
        },
        album: {
          color: {
            not: null,
          },
        },
      },
      include: {
        album: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    console.log(`找到 ${tracksWithAlbums.length} 個需要更新的 tracks`);

    if (tracksWithAlbums.length === 0) {
      console.log('沒有需要更新的 tracks');
      return;
    }

    // 批次更新每個 track 的 color
    const updatePromises = tracksWithAlbums.map(async (track) => {
      const albumColor = track.album?.color;
      if (!albumColor) return null;

      return prisma.track.update({
        where: { id: track.id },
        data: { color: albumColor },
        select: {
          id: true,
          name: true,
          color: true,
          album: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      });
    });

    // 執行所有更新操作
    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter(Boolean);

    console.log(`成功更新了 ${successfulUpdates.length} 個 tracks 的 color`);

    // 顯示前 5 個更新的範例
    console.log('\n更新範例：');
    successfulUpdates.slice(0, 5).forEach((track) => {
      if (track) {
        console.log(`  - ${track.name} → color: ${track.color} (來自專輯: ${track.album?.name})`);
      }
    });

    // 驗證更新結果
    const verifyCount = await prisma.track.count({
      where: {
        albumId: { not: null },
        album: { color: { not: null } },
        color: { not: null },
      },
    });

    console.log(`\n驗證：現在有 ${verifyCount} 個 tracks 有從專輯繼承的 color`);

  } catch (error) {
    console.error('更新過程中發生錯誤:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接執行此檔案，則運行更新函式
if (import.meta.url === `file://${process.argv[1]}`) {
  updateTrackColors()
    .then(() => {
      console.log('✅ Track color 更新完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 更新失敗:', error);
      process.exit(1);
    });
}

export default updateTrackColors;