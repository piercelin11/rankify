import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTrackColors() {
  console.log('驗證 Track color 更新結果...\n');

  try {
    // 查詢有專輯且專輯有顏色的歌曲
    const tracksWithAlbumColors = await prisma.track.findMany({
      where: {
        albumId: { not: null },
        album: { color: { not: null } },
      },
      include: {
        album: {
          select: { name: true, color: true },
        },
      },
    });

    // 統計更新狀況
    const totalTracksWithAlbums = tracksWithAlbumColors.length;
    const tracksWithMatchingColors = tracksWithAlbumColors.filter(
      track => track.color === track.album?.color
    ).length;
    const tracksWithMismatchedColors = tracksWithAlbumColors.filter(
      track => track.color !== track.album?.color
    ).length;

    console.log(`📊 統計結果：`);
    console.log(`總共有專輯且專輯有顏色的歌曲：${totalTracksWithAlbums} 首`);
    console.log(`顏色已同步的歌曲：${tracksWithMatchingColors} 首`);
    console.log(`顏色未同步的歌曲：${tracksWithMismatchedColors} 首`);
    console.log(`同步率：${((tracksWithMatchingColors / totalTracksWithAlbums) * 100).toFixed(1)}%\n`);

    // 顯示一些範例
    console.log('📝 同步成功範例：');
    const successExamples = tracksWithAlbumColors
      .filter(track => track.color === track.album?.color)
      .slice(0, 5);

    successExamples.forEach(track => {
      console.log(`  ✅ ${track.name} - ${track.album?.name} (${track.color})`);
    });

    // 如果有未同步的，顯示範例
    if (tracksWithMismatchedColors > 0) {
      console.log('\n⚠️  未同步範例：');
      const mismatchExamples = tracksWithAlbumColors
        .filter(track => track.color !== track.album?.color)
        .slice(0, 3);

      mismatchExamples.forEach(track => {
        console.log(`  ❌ ${track.name} - Track: ${track.color} vs Album: ${track.album?.color}`);
      });
    }

    // 檢查沒有專輯的歌曲
    const tracksWithoutAlbum = await prisma.track.count({
      where: { albumId: null },
    });

    console.log(`\n📝 其他統計：`);
    console.log(`沒有專輯的歌曲：${tracksWithoutAlbum} 首`);

  } catch (error) {
    console.error('驗證過程中發生錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接執行此檔案，則運行驗證函式
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyTrackColors()
    .then(() => {
      console.log('\n✅ 驗證完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 驗證失敗:', error);
      process.exit(1);
    });
}

export default verifyTrackColors;