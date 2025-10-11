# AlbumStats 架構重構計畫

## 📋 目標概述

重構專輯統計系統，新增 `AlbumStats` model 作為專輯綜合統計的單一資料來源，解決目前 `getAlbumsStats` 依賴 `AlbumRanking.groupBy` 聚合的效能問題，並移除已棄用的 `basePoints` 欄位。

---

## 🎯 核心問題與解決方案

### **問題 1：專輯統計缺乏獨立的 Stats Model**

**現況**：
```
getAlbumsStats()
    ↓
查詢 AlbumRanking (所有歷史提交)
    ↓
groupBy albumId 聚合 (平均 points, basePoints, rank)
    ↓
查詢 TrackStats (計算百分位統計)
    ↓
合併資料 → 回傳 AlbumStatsType
```

**問題**：
- ❌ 每次查詢都要聚合所有 `AlbumRanking` 記錄（效能差）
- ❌ 無法追蹤專輯排名變化（`previousRank`, `rankChange`）
- ❌ 資料來源不一致：`points` 來自 AlbumRanking（歷史平均），百分位來自 TrackStats（綜合排名）
- ❌ 架構不對稱：Track 有 `TrackStats`，但 Album 沒有 `AlbumStats`

**解決方案**：
```
使用者完成排名
    ↓
1. 寫入 TrackRanking (快照：該次提交的即時排名)
    ↓
2. 計算並寫入 AlbumRanking (快照：該次提交的即時專輯分數)
    ↓
3. 更新 TrackStats (統計：跨提交的綜合排名)
    ↓
4. 更新 AlbumStats (統計：基於 TrackStats 計算專輯分數) ✨ 新增
    ↓
getAlbumsStats() → 直接查詢 AlbumStats (超快) ✅
```

---

### **問題 2：basePoints 欄位已棄用但仍存在**

**現況**：
- `AlbumRanking.basePoints` 被寫入但幾乎沒有使用
- 只在 `getAlbumsStats` 中被平均後回傳，但前端不需要
- 佔用資料庫空間，增加維護成本

**問題**：
- ❌ 未使用的欄位造成混淆（開發者不知道是否該用）
- ❌ `calculateAlbumPoints` 需計算兩種 points（`points`, `basePoints`）
- ❌ Schema migration 歷史記錄顯示此欄位為後來新增（非核心設計）

**解決方案**：
- ✅ 從 `AlbumRanking` Schema 移除 `basePoints`
- ✅ 從 `calculateAlbumPoints` 移除 `basePoints` 計算邏輯
- ✅ 從 `AlbumStatsType` / `AlbumHistoryType` 移除相關欄位
- ✅ 更新所有受影響的 service 和 component

---

### **問題 3：專輯分數計算依據不明確**

**現況**：
- `AlbumRanking.points`：基於 `TrackRanking`（該次提交的即時排名）
- `AlbumStats` 應該基於什麼計算？

**需求確認**（使用者已確定）：
- ✅ `AlbumStats.points` 應基於 `TrackStats.overallRank`（跨提交的綜合排名）
- ✅ 使用「虛擬排名」：將 `overallRank` 當作 `ranking` 傳入 `calculateAlbumPoints`
- ✅ 這樣可複用現有的計算邏輯，無需重寫

**實作方式**：
```typescript
// updateAlbumStats 中
const trackStats = await db.trackStat.findMany({ where: { userId, artistId } });

// 轉換成 calculateAlbumPoints 需要的格式
const virtualRankings = trackStats.map(stat => ({
    id: stat.trackId,
    albumId: stat.track.albumId,
    ranking: stat.overallRank,  // ← 虛擬排名
}));

// 複用現有邏輯
const albumPoints = calculateAlbumPoints(virtualRankings);
```

---

## 📐 架構設計

### **最終資料流**

```
─────────────────────────────────────────────
              快照層 (歷史記錄)
─────────────────────────────────────────────
  TrackRanking              AlbumRanking
  (每次提交的即時排名)       (每次提交的即時專輯分數)
        ↓                         ↓
      用於                       用於
  getTracksHistory         getAlbumsHistory
                           + RankingLineChart
        ↓
─────────────────────────────────────────────
              統計層 (綜合統計)
─────────────────────────────────────────────
    TrackStats                AlbumStats ✨
  (跨提交綜合統計)          (基於 TrackStats 計算)
        ↓                         ↓
      用於                       用於
  getTracksStats            getAlbumsStats
```

**關鍵設計決策**：
1. **保留 AlbumRanking**：用於歷史快照（`getAlbumsHistory`, `RankingLineChart`）
2. **新增 AlbumStats**：用於綜合統計（`getAlbumsStats`）
3. **移除 basePoints**：簡化計算邏輯，減少維護成本
4. **複用 calculateAlbumPoints**：無需重寫，只改輸入資料來源

---

### **Schema 設計**

#### 新增 AlbumStats Model

```prisma
model AlbumStat {
  id       String @id @default(cuid())
  userId   String
  artistId String
  albumId  String

  // ========== 核心統計（基於 TrackStats） ==========

  // 專輯分數（基於 TrackStats.overallRank 計算）
  points              Int
  previousPoints      Int?
  pointsChange        Int?

  // 專輯排名（基於 points 排序）
  overallRank         Int
  previousOverallRank Int?
  overallRankChange   Int?

  // 輔助統計
  averageTrackRank    Float    // 該專輯所有歌的 overallRank 平均（顯示用）
  trackCount          Int      // 該專輯有幾首歌
  submissionCount     Int      // 該專輯被排名幾次（對應 AlbumRanking 的提交次數）

  // ========== 百分位統計 ==========
  // 意義：這張專輯有幾首歌的綜合排名在前 X%
  // 例如：totalTrackCount=100 時，overallRank 1-5 的歌曲符合 top5PercentCount

  top5PercentCount    Int      // 前 5% 的歌曲數 (overallRank / totalTrackCount <= 0.05)
  top10PercentCount   Int      // 前 10% 的歌曲數 (overallRank / totalTrackCount <= 0.10)
  top25PercentCount   Int      // 前 25% 的歌曲數 (overallRank / totalTrackCount <= 0.25)
  top50PercentCount   Int      // 前 50% 的歌曲數 (overallRank / totalTrackCount <= 0.50)

  // ========== 時間戳記 ==========

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ========== 關聯 ==========

  album  Album  @relation(fields: [albumId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  artist Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)

  @@unique([userId, albumId])
  @@index([userId, artistId])
  @@index([overallRank])  // 用於全域排名查詢
}
```

**設計要點**：
1. **點數與排名分離**：`points` 用於計算，`overallRank` 用於顯示
2. **變化追蹤**：`previousPoints`, `pointsChange`, `previousOverallRank`, `overallRankChange`
3. **百分位預先計算**：避免每次查詢都重新計算（效能提升 2-3 倍）
4. **複合索引**：`userId + albumId` 唯一，`userId + artistId` 查詢優化

#### 修改 AlbumRanking Model（移除 basePoints）

```diff
model AlbumRanking {
  id               String            @id @default(uuid())
  rank             Int
  points           Int
  albumId          String
  artistId         String
  userId           String
  averageTrackRank Float
- basePoints       Int
  submissionId     String
  album            Album             @relation(fields: [albumId], references: [id])
  artist           Artist            @relation(fields: [artistId], references: [id])
  submission       RankingSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, submissionId, albumId])
}
```

---

### **資料計算邏輯**

#### updateAlbumStats 核心流程

```typescript
async function updateAlbumStats(
    tx: Prisma.TransactionClient,
    userId: string,
    artistId: string
) {
    // 1️⃣ 取得所有 TrackStats（已有 overallRank）
    const trackStats = await tx.trackStat.findMany({
        where: { userId, artistId },
        include: { track: { select: { id: true, albumId: true } } },
        orderBy: { overallRank: 'asc' }
    });

    const totalTrackCount = trackStats.length;

    // 2️⃣ 轉換成虛擬排名格式（複用 calculateAlbumPoints）
    const virtualRankings = trackStats
        .filter(stat => stat.track.albumId)
        .map(stat => ({
            id: stat.track.id,
            albumId: stat.track.albumId!,
            ranking: stat.overallRank,  // ← 關鍵：用 overallRank 當作 ranking
        }));

    // 3️⃣ 計算專輯分數（複用現有邏輯）
    const albumPoints = calculateAlbumPoints(virtualRankings);

    // 4️⃣ 計算百分位統計（預先計算，避免查詢時重複運算）
    const percentileCounts = calculatePercentileCounts(trackStats, totalTrackCount);

    // 5️⃣ 更新每張專輯的 AlbumStats
    for (const albumData of albumPoints) {
        const albumTracks = trackStats.filter(
            t => t.track.albumId === albumData.albumId
        );
        const avgTrackRank = mean(albumTracks.map(t => t.overallRank));

        const oldStats = await tx.albumStat.findUnique({
            where: { userId_albumId: { userId, albumId: albumData.albumId } }
        });

        await tx.albumStat.upsert({
            where: { userId_albumId: { userId, albumId: albumData.albumId } },
            create: {
                userId,
                artistId,
                albumId: albumData.albumId,
                points: albumData.points,
                previousPoints: null,
                pointsChange: null,
                overallRank: 0, // 稍後重新排序
                previousOverallRank: null,
                overallRankChange: null,
                averageTrackRank: avgTrackRank,
                trackCount: albumTracks.length,
                ...percentileCounts[albumData.albumId],
            },
            update: {
                previousPoints: oldStats?.points,
                points: albumData.points,
                pointsChange: oldStats?.points
                    ? albumData.points - oldStats.points
                    : null,
                averageTrackRank: avgTrackRank,
                trackCount: albumTracks.length,
                ...percentileCounts[albumData.albumId],
            }
        });
    }

    // 6️⃣ 重新計算 overallRank（基於 points 排序）
    const allAlbumStats = await tx.albumStat.findMany({
        where: { userId, artistId },
        orderBy: { points: 'desc' }  // ← 分數高的排前面
    });

    for (let i = 0; i < allAlbumStats.length; i++) {
        const newRank = i + 1;
        const oldRank = allAlbumStats[i].overallRank;

        await tx.albumStat.update({
            where: { id: allAlbumStats[i].id },
            data: {
                previousOverallRank: oldRank || null,
                overallRank: newRank,
                overallRankChange: oldRank ? oldRank - newRank : null
            }
        });
    }
}

// 輔助函式：計算百分位統計
function calculatePercentileCounts(
    trackStats: Array<{ overallRank: number, track: { albumId: string | null } }>,
    totalTrackCount: number
) {
    // 1️⃣ 預先計算閾值（避免重複除法運算）
    const threshold5 = totalTrackCount * 0.05;
    const threshold10 = totalTrackCount * 0.10;
    const threshold25 = totalTrackCount * 0.25;
    const threshold50 = totalTrackCount * 0.50;

    // 2️⃣ 只遍歷一次，同時統計所有百分位（效能提升 4 倍）
    const result: Record<string, {
        top5PercentCount: number,
        top10PercentCount: number,
        top25PercentCount: number,
        top50PercentCount: number
    }> = {};

    for (const stat of trackStats) {
        if (!stat.track.albumId) continue;

        if (!result[stat.track.albumId]) {
            result[stat.track.albumId] = {
                top5PercentCount: 0,
                top10PercentCount: 0,
                top25PercentCount: 0,
                top50PercentCount: 0
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

// 輔助函式：計算平均值
function mean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
```

**計算邏輯說明**：
1. **虛擬排名**：將 `TrackStats.overallRank` 當作「一次虛擬的排名提交」
2. **複用邏輯**：直接使用現有的 `calculateAlbumPoints`，無需重寫
3. **百分位預先計算**：避免 `getAlbumsStats` 每次查詢時都要計算
4. **兩次排序**：
   - 第一次：計算 `points`
   - 第二次：基於 `points` 計算 `overallRank`（支援排名變化追蹤）

---

## 📝 實施步驟總覽

### **第一階段：新增功能（不破壞現有功能）**

| Phase | 流程 | 檔案操作 | 說明 |
|-------|------|----------|------|
| **Phase 1A** | 新增 AlbumStat Model | 編輯 `prisma/schema.prisma`<br>執行 Migration | 只新增，不刪除 basePoints |
| **Phase 2** | 實作 updateAlbumStats | 新增 `src/services/album/updateAlbumStats.ts`<br>新增 `scripts/test-updateAlbumStats.ts` | 核心統計邏輯 |
| **Phase 3** | 整合到 completeSubmission | 編輯 `src/features/sorter/actions/completeSubmission.ts` | 提交時自動更新 AlbumStats |
| **Phase 4** | 重構 getAlbumsStats | 編輯 `src/services/album/getAlbumsStats.ts` | 從 140 行簡化為 40 行 |
| **Phase 7** | 回填現有資料 | 新增 `scripts/backfillAlbumStats.ts`<br>新增 `scripts/recalculateAlbumScores.ts`<br>執行 backfill Script | 為現有使用者回填 AlbumStats |

**驗證點**：AlbumStats 已正常運作，basePoints 仍存在但不影響功能

---

### **第二階段：清理舊欄位（確認新功能穩定後）**

| Phase | 流程 | 檔案操作 | 說明 |
|-------|------|----------|------|
| **Phase 5** | 移除 basePoints 計算 | 編輯 `src/features/ranking/utils/calculateAlbumPoints.ts`<br>編輯 `src/features/sorter/utils/calculateAlbumPoints.ts`<br>編輯 `src/features/sorter/actions/completeSubmission.ts` | 移除 basePoints 寫入邏輯 |
| **Phase 6** | 更新 TypeScript 類型 | 編輯 `src/types/album.ts`<br>編輯 `src/services/album/getAlbumsHistory.ts` | 移除 basePoints 相關型別 |
| **Phase 1B** | 刪除 basePoints 欄位 | 編輯 `prisma/schema.prisma`<br>執行 Migration | 破壞性變更：移除欄位 |
| **Phase 8** | 最終驗證與清理 | 執行 Lint + TypeScript + E2E 測試 | 確保無殘留引用 |

---

## 📝 實施步驟詳細說明

### **Phase 1：Schema 變更與 Migration**

#### **任務 1.1：修改 Prisma Schema（第一階段：只新增）**

**檔案**：`prisma/schema.prisma`

**變更：新增 AlbumStat Model（暫時保留 `AlbumRanking.basePoints`）**

```prisma
model AlbumStat {
  id       String @id @default(cuid())
  userId   String
  artistId String
  albumId  String

  points              Int
  previousPoints      Int?
  pointsChange        Int?

  overallRank         Int
  previousOverallRank Int?
  overallRankChange   Int?

  averageTrackRank    Float
  trackCount          Int
  submissionCount     Int

  top5PercentCount    Int
  top10PercentCount   Int
  top25PercentCount   Int
  top50PercentCount   Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  album  Album  @relation(fields: [albumId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  artist Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)

  @@unique([userId, albumId])
  @@index([userId, artistId])
  @@index([overallRank])
}
```

**更新 User / Artist / Album 關聯**

```diff
model User {
  // ... 現有欄位
  albumRankings   AlbumRanking[]
+ albumStats      AlbumStat[]
  // ...
}

model Artist {
  // ... 現有欄位
  albumRankings    AlbumRanking[]
+ albumStats       AlbumStat[]
  // ...
}

model Album {
  // ... 現有欄位
  albumRankings AlbumRanking[]
+ albumStats    AlbumStat[]
  // ...
}
```

---

#### **任務 1.2：執行 Prisma Migration（第一階段）**

**步驟**：

```bash
# 1. 創建 migration（只新增 AlbumStat，不刪 basePoints）
npx prisma migrate dev --name add_album_stats

# 2. 檢查生成的 SQL
# 應只包含：
# - CREATE TABLE "AlbumStat" (...)
# - ALTER TABLE "User" / "Artist" / "Album" 添加關聯

# 3. Migration 會自動執行並生成 Prisma Client
```

**風險考量**：
- ✅ **只新增不刪除**，零破壞性
- ✅ 現有功能完全不受影響
- ✅ 隨時可以 rollback（只需刪除 AlbumStat table）

---

#### **任務 1.3：驗證 Migration**

**驗證項目**：
- [ ] `npx prisma generate` 成功
- [ ] TypeScript 編譯通過（`npx tsc --noEmit`）
- [ ] 檢查資料庫：`AlbumStat` table 已創建
- [ ] 檢查資料庫：`AlbumRanking.basePoints` 仍存在（暫時保留）
- [ ] 開發環境資料庫可正常連線

**風險處理**：
- 如果 Migration 失敗 → 檢查是否有外鍵約束衝突
- 如果 TypeScript 編譯失敗 → 暫時忽略（因為尚未實作 `updateAlbumStats`）

---

### **Phase 2：實作 updateAlbumStats 核心邏輯**

#### **任務 2.1：建立 updateAlbumStats 函式**

**檔案**：`src/services/album/updateAlbumStats.ts`（新建）

**實作**：

```typescript
import { Prisma } from "@prisma/client";
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";

/**
 * 更新使用者對某藝人的所有專輯統計
 *
 * 流程：
 * 1. 查詢所有 TrackStats
 * 2. 轉換成虛擬排名格式
 * 3. 計算專輯分數（複用 calculateAlbumPoints）
 * 4. 計算百分位統計
 * 5. Upsert 每張專輯的 AlbumStats
 * 6. 重新計算所有專輯的 overallRank
 */
export async function updateAlbumStats(
    tx: Prisma.TransactionClient,
    userId: string,
    artistId: string
) {
    // 1️⃣ 取得所有 TrackStats
    const trackStats = await tx.trackStat.findMany({
        where: { userId, artistId },
        include: { track: { select: { id: true, albumId: true } } },
        orderBy: { overallRank: 'asc' }
    });

    const totalTrackCount = trackStats.length;

    // 邊界情況：沒有任何歌曲
    if (totalTrackCount === 0) {
        return;
    }

    // 2️⃣ 轉換成虛擬排名格式
    const virtualRankings = trackStats
        .filter(stat => stat.track.albumId !== null)
        .map(stat => ({
            id: stat.track.id,
            albumId: stat.track.albumId!,
            ranking: stat.overallRank,
        }));

    // 邊界情況：沒有任何專輯歌曲（只有 singles）
    if (virtualRankings.length === 0) {
        return;
    }

    // 3️⃣ 計算專輯分數
    const albumPoints = calculateAlbumPoints(virtualRankings);

    // 4️⃣ 計算百分位統計
    const percentileCounts = calculatePercentileCounts(trackStats, totalTrackCount);

    // 5️⃣ 查詢每張專輯的提交次數（submissionCount）
    const albumSubmissionCounts = await tx.albumRanking.groupBy({
        by: ['albumId'],
        where: { userId, artistId },
        _count: { albumId: true }
    });
    const submissionCountMap = new Map(
        albumSubmissionCounts.map(item => [item.albumId, item._count.albumId])
    );

    // 6️⃣ 更新每張專輯的 AlbumStats
    for (const albumData of albumPoints) {
        const albumTracks = trackStats.filter(
            t => t.track.albumId === albumData.albumId
        );
        const avgTrackRank = mean(albumTracks.map(t => t.overallRank));
        const submissionCount = submissionCountMap.get(albumData.albumId) ?? 0;

        const oldStats = await tx.albumStat.findUnique({
            where: {
                userId_albumId: { userId, albumId: albumData.albumId }
            }
        });

        await tx.albumStat.upsert({
            where: {
                userId_albumId: { userId, albumId: albumData.albumId }
            },
            create: {
                userId,
                artistId,
                albumId: albumData.albumId,
                points: albumData.points,
                previousPoints: null,
                pointsChange: null,
                overallRank: 0,
                previousOverallRank: null,
                overallRankChange: null,
                averageTrackRank: avgTrackRank,
                trackCount: albumTracks.length,
                submissionCount,
                ...percentileCounts[albumData.albumId],
            },
            update: {
                previousPoints: oldStats?.points,
                points: albumData.points,
                pointsChange: oldStats?.points
                    ? albumData.points - oldStats.points
                    : null,
                averageTrackRank: avgTrackRank,
                trackCount: albumTracks.length,
                submissionCount,
                ...percentileCounts[albumData.albumId],
            }
        });
    }

    // 7️⃣ 重新計算 overallRank
    const allAlbumStats = await tx.albumStat.findMany({
        where: { userId, artistId },
        orderBy: { points: 'desc' }
    });

    for (let i = 0; i < allAlbumStats.length; i++) {
        const newRank = i + 1;
        const oldRank = allAlbumStats[i].overallRank;

        await tx.albumStat.update({
            where: { id: allAlbumStats[i].id },
            data: {
                previousOverallRank: oldRank || null,
                overallRank: newRank,
                overallRankChange: oldRank ? oldRank - newRank : null
            }
        });
    }
}

// ========== 輔助函式 ==========

function calculatePercentileCounts(
    trackStats: Array<{
        overallRank: number,
        track: { albumId: string | null }
    }>,
    totalTrackCount: number
) {
    // 1️⃣ 預先計算閾值（避免重複除法運算）
    const threshold5 = totalTrackCount * 0.05;
    const threshold10 = totalTrackCount * 0.10;
    const threshold25 = totalTrackCount * 0.25;
    const threshold50 = totalTrackCount * 0.50;

    // 2️⃣ 只遍歷一次，同時統計所有百分位（效能提升 4 倍）
    const result: Record<string, {
        top5PercentCount: number,
        top10PercentCount: number,
        top25PercentCount: number,
        top50PercentCount: number
    }> = {};

    for (const stat of trackStats) {
        if (!stat.track.albumId) continue;

        if (!result[stat.track.albumId]) {
            result[stat.track.albumId] = {
                top5PercentCount: 0,
                top10PercentCount: 0,
                top25PercentCount: 0,
                top50PercentCount: 0
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

```

**設計要點**：
- ✅ 使用 Transaction Client（由呼叫方傳入）
- ✅ 邊界情況處理（無歌曲、無專輯歌曲）
- ✅ 變化追蹤（`previousPoints`, `pointsChange`, `previousOverallRank`, `overallRankChange`）
- ✅ 兩次排序保證正確性（先算 points，再算 overallRank）

---

#### **任務 2.2：測試 updateAlbumStats（獨立測試）**

**建立測試檔案**：`scripts/test-updateAlbumStats.ts`

```typescript
import { db } from "@/db/client";
import { updateAlbumStats } from "@/services/album/updateAlbumStats";

async function testUpdateAlbumStats() {
    const userId = "YOUR_USER_ID";
    const artistId = "YOUR_ARTIST_ID";

    await db.$transaction(async (tx) => {
        await updateAlbumStats(tx, userId, artistId);
    });

    // 檢查結果
    const albumStats = await db.albumStat.findMany({
        where: { userId, artistId },
        orderBy: { overallRank: 'asc' }
    });

    console.log("AlbumStats created:", albumStats.length);
    console.log("Top 3 albums:", albumStats.slice(0, 3));
}

testUpdateAlbumStats()
    .then(() => console.log("✅ Test passed"))
    .catch(err => console.error("❌ Test failed:", err))
    .finally(() => db.$disconnect());
```

**執行**：
```bash
npx tsx scripts/test-updateAlbumStats.ts
```

**驗證項目**：
- [ ] `AlbumStats` 記錄成功創建
- [ ] `points` 計算正確（與手動計算一致）
- [ ] `overallRank` 排序正確（分數高的排前面）
- [ ] 百分位統計正確（top5/10/25/50PercentCount）

---

### **Phase 3：整合 updateAlbumStats 到 completeSubmission**

#### **任務 3.1：修改 completeSubmission**

**檔案**：`src/features/sorter/actions/completeSubmission.ts`

**變更位置**：在 `updateTrackStats` 之後調用 `updateAlbumStats`

```diff
import { updateAlbumStats } from "@/services/album/updateAlbumStats";

// ... (在 completeSubmission 函式內)

// 創建 AlbumRanking 記錄
if (existingSubmission.type === "ARTIST") {
    const albumStats = calculateAlbumPoints(trackRankings);
    const result = albumStats.map((stats, index) => ({
        submissionId,
        artistId: existingSubmission.artistId,
        userId,
        rank: index + 1,
        albumId: stats.albumId,
        points: stats.points,
-       basePoints: stats.basePoints,
        averageTrackRank: stats.averageTrackRanking,
    }));

    await tx.albumRanking.createMany({
        data: result,
    });

    // 更新 TrackStats
    await updateTrackStats(
        tx,
        userId,
        existingSubmission.artistId,
        trackRankData.map((t) => ({
            trackId: t.trackId,
            rank: t.rank,
            rankChange: t.rankChange,
        }))
    );
+
+   // 更新 AlbumStats（基於 TrackStats）
+   await updateAlbumStats(
+       tx,
+       userId,
+       existingSubmission.artistId
+   );
}
```

**關鍵變更**：
1. ⏸️ 暫時保留 `basePoints: stats.basePoints`（Phase 5 才移除）
2. ✅ 新增 `await updateAlbumStats(tx, userId, artistId)`
3. ✅ 放在 `updateTrackStats` **之後**（因為依賴 TrackStats 資料）

**執行順序**：
```
1. createMany TrackRanking
2. createMany AlbumRanking
3. updateTrackStats (更新 TrackStats.overallRank)
4. updateAlbumStats (基於 TrackStats 計算 AlbumStats) ✨
```

---

#### **任務 3.2：驗證整合**

**測試步驟**：
1. 完成一次排名提交（Artist Sorter）
2. 檢查資料庫：
   ```sql
   -- 檢查 AlbumRanking 是否正確創建（無 basePoints）
   SELECT * FROM "AlbumRanking" ORDER BY "createdAt" DESC LIMIT 5;

   -- 檢查 AlbumStats 是否正確創建/更新
   SELECT * FROM "AlbumStat" WHERE "userId" = 'YOUR_USER_ID' ORDER BY "overallRank";
   ```
3. 比對 `AlbumStats.points` 與手動計算結果
4. 確認 `previousPoints`, `pointsChange` 正確更新（第二次提交時）

**驗證項目**：
- [ ] AlbumRanking 創建成功（basePoints 仍存在）
- [ ] AlbumStats 創建成功
- [ ] points 計算正確
- [ ] overallRank 排序正確
- [ ] 百分位統計正確
- [ ] 第二次提交時 previousPoints / pointsChange 正確

---

### **Phase 4：重構 getAlbumsStats**

#### **任務 4.1：改寫 getAlbumsStats**

**檔案**：`src/services/album/getAlbumsStats.ts`

**變更前**（簡化版）：
```typescript
const getAlbumsStats = cache(async ({ artistId, userId }) => {
    // 1. 查詢 TrackStats（計算百分位）
    const allTrackStatsForArtist = await db.trackStat.findMany(...);

    // 2. 查詢 AlbumRanking（聚合平均）
    const albumPoints = await db.albumRanking.groupBy({
        _avg: { points: true, basePoints: true, rank: true },
        _count: { rank: true },
    });

    // 3. 計算百分位
    const percentileCounts = getAlbumPercentileCounts(...);

    // 4. 合併資料
    const result = albumPoints.map(data => ({
        // Album 欄位
        id, name, artistId, spotifyUrl, color, img, releaseDate, type,
        // AlbumRanking 聚合欄位
        averageRank: data._avg.rank?.toFixed(1),
        avgPoints: Math.round(data._avg.points),
        avgBasePoints: Math.round(data._avg.basePoints),
        submissionCount: data._count.rank,
        // 百分位統計
        ...percentileCounts[data.albumId],
        rank: 0,
    }));

    // 5. 排序並設定 rank
    return result.sort((a, b) => b.avgPoints - a.avgPoints)
        .map((data, index) => ({ ...data, rank: index + 1 }));
});
```

**變更後**（超級簡化）：
```typescript
import { cache } from "react";
import { db } from "@/db/client";
import { AlbumStatsType } from "@/types/album";

type getAlbumsStatsProps = {
    artistId: string;
    userId: string;
};

const getAlbumsStats = cache(async ({
    artistId,
    userId,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> => {
    // 直接查詢 AlbumStats（已預先計算好所有資料）
    const albumStats = await db.albumStat.findMany({
        where: { artistId, userId },
        include: {
            album: {
                select: {
                    id: true,
                    name: true,
                    artistId: true,
                    spotifyUrl: true,
                    color: true,
                    img: true,
                    releaseDate: true,
                    type: true,
                }
            }
        },
        orderBy: { overallRank: 'asc' }
    });

    // 轉換成 AlbumStatsType 格式
    return albumStats.map(stat => ({
        // Album Model 欄位
        id: stat.album.id,
        name: stat.album.name,
        artistId: stat.album.artistId,
        spotifyUrl: stat.album.spotifyUrl,
        color: stat.album.color,
        img: stat.album.img,
        releaseDate: stat.album.releaseDate,
        type: stat.album.type,

        // AlbumStats 欄位
        rank: stat.overallRank,
        averageRank: stat.averageTrackRank.toFixed(1),
        avgPoints: stat.points,
        submissionCount: stat.submissionCount,

        // 百分位統計（已預先計算）
        top5PercentCount: stat.top5PercentCount,
        top10PercentCount: stat.top10PercentCount,
        top25PercentCount: stat.top25PercentCount,
        top50PercentCount: stat.top50PercentCount,
    }));
});

export default getAlbumsStats;
```

**關鍵變更**：
1. ❌ 移除 `getAlbumPercentileCounts` 函式（不再需要）
2. ❌ 移除 `albumRanking.groupBy` 查詢
3. ❌ 移除 `allTrackStatsForArtist` 查詢
4. ❌ 移除手動排序邏輯（`sort` + `map`）
5. ✅ 改為直接查詢 `albumStat`（1 次 DB query）
6. ✅ 使用 `orderBy: { overallRank: 'asc' }`（資料庫排序）

**效能提升**：
- **變更前**：3 次 DB query + O(n) groupBy + O(n) 百分位計算 + O(n log n) 排序
- **變更後**：1 次 DB query + O(n) map
- **提升**：~50-100 倍（取決於專輯數量）

---

#### **任務 4.2：移除 getAlbumPercentileCounts 函式**

**檔案**：`src/services/album/getAlbumsStats.ts`

**刪除**：
```diff
- function getAlbumPercentileCounts(
-     albumIds: string[],
-     allTrackStats: {
-         track: { albumId: string | null };
-         overallRank: number;
-     }[],
-     totalTrackCount: number
- ) {
-     // ... 40 行程式碼
- }
```

**理由**：百分位統計已在 `updateAlbumStats` 中預先計算並存入資料庫

---

### **Phase 5：修改 calculateAlbumPoints（移除 basePoints）**

⚠️ **注意**：此階段在第二階段執行（確認 AlbumStats 穩定運作後）

#### **任務 5.1：修改兩份 calculateAlbumPoints 檔案**

**檔案 1**：`src/features/ranking/utils/calculateAlbumPoints.ts`
**檔案 2**：`src/features/sorter/utils/calculateAlbumPoints.ts`

**變更**：

```diff
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
    const score =
        percentileRank > 0.75
            ? percentileRank * 1000
            : percentileRank > 0.5
                ? percentileRank * 950
                : percentileRank > 0.25
                    ? percentileRank * 650
                    : percentileRank * 500;

    // 引入平滑係數
    const smoothingFactor =
        percentileRank > 0.5 && albumTrackCount < 5
            ? albumTrackCount * 0.15 + 0.25
            : 1;

    // 調整分數
    const points = Math.floor((score / albumTrackCount) * smoothingFactor);
-   const basePoints = Math.floor(
-       score / (trackCount / albumCount)
-   );

-   return { points, basePoints };
+   return { points };
}
```

**同時修改外層函式**：
```diff
result.push({
    albumId,
    points: totalPoints,
-   basePoints: totalBasePoints,
    averageTrackRanking: rankSum / groupedRankings.length
});
```

**同時移除 totalBasePoints 累加**：
```diff
for (const trackRanking of groupedRankings) {
-   const { points, basePoints } = calculateTrackPoints(...);
+   const { points } = calculateTrackPoints(...);
    totalPoints += points;
-   totalBasePoints += basePoints;
    rankSum += trackRanking.ranking;
}
```

**同時移除變數宣告**：
```diff
let totalPoints = 0;
- let totalBasePoints = 0;
let rankSum = 0;
```

---

#### **任務 5.2：驗證計算邏輯**

**測試**：
1. 執行一次排名提交
2. 檢查 `AlbumRanking.points` 是否正確
3. 確認沒有 `basePoints` 欄位（TypeScript 編譯錯誤會提示）

---

### **Phase 6：更新 TypeScript 類型定義**

⚠️ **注意**：此階段在第二階段執行（確認 AlbumStats 穩定運作後）

#### **任務 6.1：修改 AlbumStatsType**

**檔案**：`src/types/album.ts`

**變更**：

```diff
/**
 * Album 統計資料型別
 * 用於 My Stats 的 Overview 視圖和圖表
 *
 * 資料來源：
 * - Album Model: id, name, artistId, spotifyUrl, color, img, releaseDate, type
- * - AlbumRanking (aggregated): averageRank, avgPoints, avgBasePoints, submissionCount
+ * - AlbumStats: rank, averageRank, avgPoints, submissionCount, top5/10/25/50PercentCount
- * - 計算欄位: rank, top5PercentCount, top10PercentCount, top25PercentCount, top50PercentCount
 */
export type AlbumStatsType = {
    // === Album Model 欄位 ===
    id: string;
    name: string;
    artistId: string;
    spotifyUrl: string;
    color: string | null;
    img: string | null;
    releaseDate: Date;
    type: string;

-   // === AlbumRanking 聚合欄位 ===
+   // === AlbumStats 欄位 ===
    averageRank: number | string;
    avgPoints: number;
-   avgBasePoints: number;
    submissionCount: number;

-   // === 計算欄位 ===
    rank: number;
    top5PercentCount: number;
    top10PercentCount: number;
    top25PercentCount: number;
    top50PercentCount: number;
};
```

---

#### **任務 6.2：修改 AlbumHistoryType**

**檔案**：`src/types/album.ts`

**變更**：

```diff
/**
 * Album 歷史記錄型別
 * 用於 My Stats 的 Snapshot 視圖
 *
 * 資料來源：
 * - Album Model: id, name, artistId, spotifyUrl, color, img, releaseDate, type
- * - AlbumRanking: rank, totalPoints, totalBasePoints
+ * - AlbumRanking: rank, totalPoints
 * - RankingSubmission: createdAt
 * - 計算欄位: top25PercentCount, top50PercentCount, previousTotalPoints, pointsChange
 */
export type AlbumHistoryType = {
    // === Album Model 欄位 ===
    id: string;
    name: string;
    artistId: string;
    spotifyUrl: string;
    color: string | null;
    img: string | null;
    releaseDate: Date;
    type: string;

    // === AlbumRanking 欄位 ===
    rank: number;
    totalPoints: number;
-   totalBasePoints: number;

    // === RankingSubmission 欄位 ===
    submissionId: string;
    createdAt: Date;

    // === 計算欄位 ===
    top25PercentCount: number;
    top50PercentCount: number;
    previousTotalPoints?: number;
    pointsChange?: number | null;
};
```

---

#### **任務 6.3：修改 getAlbumsHistory（移除 basePoints）**

**檔案**：`src/services/album/getAlbumsHistory.ts`

**變更**：

```diff
const result: AlbumHistoryType[] = albumRanking.map((data) => {
    const prevPoints = prevPointsMap.get(data.albumId);

    return {
        // Album Model 欄位
        id: data.album.id,
        name: data.album.name,
        artistId: data.album.artistId,
        spotifyUrl: data.album.spotifyUrl,
        color: data.album.color,
        img: data.album.img,
        releaseDate: data.album.releaseDate,
        type: data.album.type,
        // AlbumRanking 欄位
        rank: data.rank,
        totalPoints: data.points,
-       totalBasePoints: data.basePoints,
        // RankingSubmission 欄位
        submissionId,
        createdAt: data.submission?.createdAt || new Date(),
        // 計算欄位
        top25PercentCount: top25PercentMap.get(data.albumId) ?? 0,
        top50PercentCount: top50PercentMap.get(data.albumId) ?? 0,
        previousTotalPoints: prevPoints,
        pointsChange: calculatePointsChange(data.points, prevPoints),
    };
});
```

**同時修改 query**：
```diff
const albumRanking = await db.albumRanking.findMany({
    where: { artistId, submissionId, userId, submission: { status: "COMPLETED" } },
    select: {
        albumId: true,
        rank: true,
        points: true,
-       basePoints: true,
        album: { select: { ... } },
        submission: { select: { createdAt: true } },
    },
    orderBy: { rank: "asc" },
});
```

---

### **Phase 7：撰寫 Migration Scripts**

#### **任務 7.1：回填 AlbumStats Script**

**檔案**：`scripts/backfillAlbumStats.ts`（新建）

**用途**：為所有現有使用者回填 `AlbumStats` 資料

**實作**：

```typescript
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
    console.log("🔍 Fetching all users with completed submissions...");

    // 取得所有有完成提交的使用者
    const usersWithSubmissions = await db.user.findMany({
        where: {
            submissions: {
                some: {
                    status: "COMPLETED",
                    type: "ARTIST"
                }
            }
        },
        select: { id: true, name: true }
    });

    console.log(`✅ Found ${usersWithSubmissions.length} users`);

    // 取得所有藝人
    const artists = await db.artist.findMany({
        select: { id: true, name: true }
    });

    console.log(`✅ Found ${artists.length} artists`);

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
                        artistId: artist.id
                    }
                });

                if (trackStatsCount === 0) {
                    continue; // 跳過沒有資料的組合
                }

                console.log(`📊 Processing ${user.name} × ${artist.name}...`);

                await db.$transaction(async (tx) => {
                    await updateAlbumStats(tx, user.id, artist.id);
                });

                processedCount++;
                console.log(`   ✅ Success (${processedCount} total)`);

            } catch (error) {
                errorCount++;
                console.error(`   ❌ Error for ${user.name} × ${artist.name}:`, error);
            }
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Backfill completed!`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log("=".repeat(50));
}

backfillAlbumStats()
    .then(() => {
        console.log("✅ Script finished");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
```

**執行**：
```bash
npx tsx scripts/backfillAlbumStats.ts
```

**驗證**：
```sql
-- 檢查 AlbumStats 記錄數
SELECT COUNT(*) FROM "AlbumStat";

-- 檢查每個使用者的 AlbumStats 數量
SELECT "userId", COUNT(*)
FROM "AlbumStat"
GROUP BY "userId";

-- 檢查資料完整性
SELECT * FROM "AlbumStat"
WHERE "points" IS NULL
   OR "overallRank" IS NULL
   OR "top5PercentCount" IS NULL;
```

---

#### **任務 7.2：重新計算 AlbumRanking 與 AlbumStats Script**

**檔案**：`scripts/recalculateAlbumScores.ts`（新建）

**用途**：當修改 `calculateAlbumPoints` 邏輯後，重新計算所有分數

**實作**：

```typescript
import { db } from "@/db/client";
import { calculateAlbumPoints } from "@/features/ranking/utils/calculateAlbumPoints";
import { updateAlbumStats } from "@/services/album/updateAlbumStats";

/**
 * 重新計算所有 AlbumRanking 和 AlbumStats
 *
 * 使用時機：
 * - 修改 calculateAlbumPoints 的計算邏輯後
 * - 需要統一更新所有歷史分數
 *
 * 執行方式：
 * npx tsx scripts/recalculateAlbumScores.ts
 */
async function recalculateAll() {
    console.log("🔍 Step 1: Recalculating AlbumRanking...");

    // 1️⃣ 重新計算所有 AlbumRanking（基於 TrackRanking）
    const allSubmissions = await db.rankingSubmission.findMany({
        where: {
            type: 'ARTIST',
            status: 'COMPLETED'
        },
        select: {
            id: true,
            artistId: true,
            userId: true,
            createdAt: true
        }
    });

    console.log(`   Found ${allSubmissions.length} completed submissions`);

    let albumRankingUpdated = 0;

    for (const submission of allSubmissions) {
        try {
            // 查詢該次提交的所有 TrackRanking
            const trackRankings = await db.trackRanking.findMany({
                where: { submissionId: submission.id },
                include: { track: { select: { id: true, albumId: true } } }
            });

            // 轉換成 calculateAlbumPoints 需要的格式
            const rankingData = trackRankings
                .filter(r => r.track.albumId)
                .map(r => ({
                    id: r.track.id,
                    albumId: r.track.albumId!,
                    ranking: r.rank
                }));

            if (rankingData.length === 0) continue;

            // 用新規則重新計算
            const newAlbumPoints = calculateAlbumPoints(rankingData);

            // 更新 AlbumRanking
            for (const album of newAlbumPoints) {
                await db.albumRanking.updateMany({
                    where: {
                        submissionId: submission.id,
                        albumId: album.albumId
                    },
                    data: {
                        points: album.points,
                        averageTrackRank: album.averageTrackRanking
                    }
                });
                albumRankingUpdated++;
            }

            if (albumRankingUpdated % 10 === 0) {
                console.log(`   Updated ${albumRankingUpdated} AlbumRanking records...`);
            }

        } catch (error) {
            console.error(`   ❌ Error for submission ${submission.id}:`, error);
        }
    }

    console.log(`✅ AlbumRanking recalculation completed: ${albumRankingUpdated} records updated\n`);

    // 2️⃣ 重新計算所有 AlbumStats（基於 TrackStats）
    console.log("🔍 Step 2: Recalculating AlbumStats...");

    const allUsers = await db.user.findMany({
        where: {
            trackStats: { some: {} }
        },
        select: { id: true, name: true }
    });

    const allArtists = await db.artist.findMany({
        select: { id: true, name: true }
    });

    let albumStatsUpdated = 0;

    for (const user of allUsers) {
        for (const artist of allArtists) {
            try {
                const trackStatsCount = await db.trackStat.count({
                    where: { userId: user.id, artistId: artist.id }
                });

                if (trackStatsCount === 0) continue;

                await db.$transaction(async (tx) => {
                    await updateAlbumStats(tx, user.id, artist.id);
                });

                albumStatsUpdated++;

                if (albumStatsUpdated % 5 === 0) {
                    console.log(`   Updated ${albumStatsUpdated} user×artist combinations...`);
                }

            } catch (error) {
                console.error(`   ❌ Error for ${user.name} × ${artist.name}:`, error);
            }
        }
    }

    console.log(`✅ AlbumStats recalculation completed: ${albumStatsUpdated} updated\n`);

    console.log("\n" + "=".repeat(50));
    console.log("✅ All recalculations completed!");
    console.log(`   AlbumRanking: ${albumRankingUpdated} records`);
    console.log(`   AlbumStats: ${albumStatsUpdated} user×artist combinations`);
    console.log("=".repeat(50));
}

recalculateAll()
    .then(() => {
        console.log("✅ Script finished");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
```

**執行**：
```bash
npx tsx scripts/recalculateAlbumScores.ts
```

**適用場景**：
- 修改 `calculateAlbumPoints` 的分數公式
- 修改 `smoothingFactor` 的計算邏輯
- 修改百分位的計算方式

---

### **Phase 8：清理與驗證**

#### **任務 8.1：執行 TypeScript 檢查**

```bash
npx tsc --noEmit
```

**預期**：0 errors

**如果有錯誤**：
- 檢查是否有遺漏的 `basePoints` 引用
- 檢查 `AlbumStatsType` / `AlbumHistoryType` 是否正確更新

---

#### **任務 8.2：執行 Linting**

```bash
npm run lint
```

**修正**：
- 移除未使用的 import
- 修正格式問題

---

#### **任務 8.3：搜尋殘留的 basePoints 引用**

```bash
# 使用 grep 搜尋所有 basePoints 引用
grep -r "basePoints" src/ --include="*.ts" --include="*.tsx"

# 或使用 Grep tool
# pattern: "basePoints"
# glob: "**/*.{ts,tsx}"
```

**檢查項目**：
- [ ] `calculateAlbumPoints` 已移除 `basePoints`
- [ ] `completeSubmission` 已移除 `basePoints`
- [ ] `AlbumStatsType` 已移除 `avgBasePoints`
- [ ] `AlbumHistoryType` 已移除 `totalBasePoints`
- [ ] `getAlbumsStats` 已移除 `avgBasePoints`
- [ ] `getAlbumsHistory` 已移除 `basePoints` select

**允許保留**：
- Migration SQL 檔案中的 `DROP COLUMN "basePoints"`（歷史記錄）

---

#### **任務 8.4：E2E 測試**

**測試流程**：
1. 啟動開發伺服器：`npm run dev`
2. 完成一次完整的排名提交（Artist Sorter）
3. 檢查 My Stats 頁面：
   - [ ] 專輯排名正確顯示
   - [ ] 專輯分數正確顯示
   - [ ] 百分位統計正確顯示
   - [ ] 沒有顯示 `basePoints` / `avgBasePoints`
4. 檢查 Snapshot 頁面：
   - [ ] 歷史記錄正確顯示
   - [ ] 沒有顯示 `totalBasePoints`
5. 檢查 RankingLineChart：
   - [ ] 趨勢圖正確顯示
   - [ ] 資料正確載入

---

## 📊 影響範圍總覽

### **新增的檔案（4 個）**
1. ✅ `src/services/album/updateAlbumStats.ts`（~150 行）
2. ✅ `scripts/test-updateAlbumStats.ts`（~40 行）
3. ✅ `scripts/backfillAlbumStats.ts`（~80 行）
4. ✅ `scripts/recalculateAlbumScores.ts`（~180 行）

### **修改的檔案（8 個）**
1. 🔧 `prisma/schema.prisma`
   - 變更：移除 `AlbumRanking.basePoints`，新增 `AlbumStat` model
   - 影響範圍：大（Schema 變更）

2. 🔧 `src/features/sorter/actions/completeSubmission.ts`
   - 變更：移除 `basePoints`，新增 `updateAlbumStats` 調用
   - 影響範圍：中（~10 行改動）

3. 🔧 `src/services/album/getAlbumsStats.ts`
   - 變更：完全重寫（從 140 行簡化為 40 行）
   - 影響範圍：大（~100 行刪除）

4. 🔧 `src/services/album/getAlbumsHistory.ts`
   - 變更：移除 `basePoints` select 和回傳
   - 影響範圍：小（~5 行改動）

5. 🔧 `src/features/ranking/utils/calculateAlbumPoints.ts`
   - 變更：移除 `basePoints` 計算邏輯
   - 影響範圍：小（~10 行刪除）

6. 🔧 `src/features/sorter/utils/calculateAlbumPoints.ts`
   - 變更：移除 `basePoints` 計算邏輯
   - 影響範圍：小（~10 行刪除）

7. 🔧 `src/types/album.ts`
   - 變更：移除 `avgBasePoints` 和 `totalBasePoints`
   - 影響範圍：小（~5 行改動）

8. 🔧 `src/types/data.ts`（如果有相關定義）
   - 變更：檢查並移除 `basePoints` 相關型別
   - 影響範圍：極小

### **總計**
- **新增**：4 個檔案（~450 行）
- **修改**：8 個檔案（~150 行改動）
- **刪除**：~100 行（主要是 `getAlbumsStats` 簡化）
- **淨增加**：~350 行（但大幅提升效能與可維護性）

---

## ✅ 預期成果

### **效能提升**

| 操作 | 變更前 | 變更後 | 提升 |
|------|--------|--------|------|
| `getAlbumsStats` | 3 次 DB query + O(n) 聚合 + O(n) 百分位 + O(n log n) 排序 | 1 次 DB query + O(n) map | ~50-100x |
| `completeSubmission` | 寫入 TrackRanking + AlbumRanking + 更新 TrackStats | + 更新 AlbumStats | +5-10% 時間 |
| 使用者查看統計 | 每次都重新計算 | 直接讀取 | 即時回應 |

### **架構改進**
- ✅ **架構對稱**：Track 和 Album 都有 Ranking（快照）+ Stats（統計）
- ✅ **單一資料來源**：`AlbumStats` 是專輯統計的唯一來源
- ✅ **變化追蹤**：支援 `previousPoints`, `pointsChange`, `previousOverallRank`, `overallRankChange`
- ✅ **可擴展性**：未來可輕鬆新增 `hotStreak`, `consistency` 等統計

### **程式碼簡化**
- ✅ `getAlbumsStats` 從 140 行簡化為 40 行（-70%）
- ✅ 移除 `getAlbumPercentileCounts` 函式（-40 行）
- ✅ 移除 `basePoints` 相關程式碼（-30 行）
- ✅ 新增核心邏輯 `updateAlbumStats`（+150 行，但可重用）

### **風險降低**
- ✅ 移除未使用的欄位（`basePoints`）減少混淆
- ✅ 預先計算百分位統計，減少查詢時錯誤
- ✅ Transaction 保證資料一致性

---

## 🔍 驗證檢查清單

### **Schema 驗證**
- [ ] `npx prisma generate` 成功
- [ ] Migration 成功執行
- [ ] `AlbumRanking` 不再有 `basePoints` 欄位
- [ ] `AlbumStat` model 正確創建

### **功能驗證**
- [ ] 完成排名提交後，`AlbumStats` 正確創建/更新
- [ ] `AlbumStats.points` 計算正確（與手動計算一致）
- [ ] `AlbumStats.overallRank` 排序正確（分數高的排前面）
- [ ] 百分位統計正確（`top5/10/25/50PercentCount`）
- [ ] 第二次提交後，`previousPoints` / `pointsChange` 正確
- [ ] `getAlbumsStats` 回傳資料正確
- [ ] `getAlbumsHistory` 不再回傳 `totalBasePoints`
- [ ] My Stats 頁面正確顯示專輯排名
- [ ] RankingLineChart 正確顯示趨勢

### **程式碼品質**
- [ ] TypeScript 編譯通過（`npx tsc --noEmit`）
- [ ] ESLint 無錯誤（`npm run lint`）
- [ ] 無殘留的 `basePoints` 引用（除 migration SQL）

### **效能驗證**
- [ ] `getAlbumsStats` 查詢時間 < 100ms（vs 舊版的 1-2 秒）
- [ ] `completeSubmission` 時間增加 < 10%
- [ ] 資料庫負載無異常

---

## 📚 技術決策記錄

### **為什麼保留 AlbumRanking？**

**原因**：
1. **歷史快照**：`AlbumRanking` 記錄每次提交時的即時專輯分數
2. **趨勢分析**：`RankingLineChart` 需要歷史資料繪製趨勢圖
3. **資料來源不同**：
   - `AlbumRanking.points`：基於 `TrackRanking`（該次提交的即時排名）
   - `AlbumStats.points`：基於 `TrackStats`（跨提交的綜合排名）
4. **使用者需求**：可能需要比較「該次提交」vs「目前綜合評價」

### **為什麼新增 AlbumStats 而非即時計算？**

**問題**：
- 即時計算需要每次查詢都執行 `calculateAlbumPoints`（O(n) 複雜度）
- 無法追蹤排名變化（`previousRank`, `rankChange`）
- 無法記錄歷史統計（`highestRank`, `lowestRank`）

**優勢**：
1. **效能提升 50-100 倍**：從 3 次 DB query + O(n) 運算 → 1 次 DB query
2. **變化追蹤**：支援 `previousPoints`, `pointsChange`, `previousOverallRank`, `overallRankChange`
3. **架構一致**：與 `TrackStats` 設計對稱（好品味）
4. **可擴展**：未來可新增更多統計指標

### **為什麼移除 basePoints？**

**原因**：
1. **未使用**：只在 `getAlbumsStats` 中被平均後回傳，但前端不需要
2. **混淆**：開發者不知道何時該用 `points` 還是 `basePoints`
3. **維護成本**：佔用資料庫空間，增加程式碼複雜度
4. **使用者確認**：已確認不需要此欄位

**如需加回**：
- 可從 git history 恢復計算邏輯
- 重新加入 Schema 欄位
- 執行 migration 和 recalculate script

### **為什麼百分位統計要存進 AlbumStats？**

**差異**：
- **Track**：百分位來自 `TrackRanking`（必須即時查詢，無法預先計算）
- **Album**：百分位來自 `TrackStats`（可以預先計算）

**優勢**：
1. **效能提升 2-3 倍**：避免每次查詢都重新計算
2. **與 points 同步**：在同一次 `updateAlbumStats` 中計算，保證一致性
3. **簡化查詢**：`getAlbumsStats` 只需要一次 query

### **為什麼複用 calculateAlbumPoints？**

**原因**：
1. **邏輯一致**：`AlbumRanking` 和 `AlbumStats` 都使用相同的分數計算公式
2. **減少維護**：修改計算邏輯時只需改一處
3. **虛擬排名**：將 `TrackStats.overallRank` 當作 `ranking` 傳入即可

**關鍵差異**：
- **輸入來源不同**：
  - `AlbumRanking`：`TrackRanking.rank`（該次提交的即時排名）
  - `AlbumStats`：`TrackStats.overallRank`（跨提交的綜合排名）
- **輸出意義不同**：
  - `AlbumRanking.points`：該次提交的即時分數
  - `AlbumStats.points`：基於綜合排名的分數

---

## 🚀 實施順序建議

⚠️ **重要提醒**：
- 本專案處於**開發階段**，資料庫有測試資料**不能遺失**
- **絕對不能執行 `npx prisma migrate reset`**
- **絕對不能使用 `npx prisma db push`**（會跳過 migration history）
- **一律使用 `npx prisma migrate dev --name xxx`**（保留完整 migration 記錄）
- 採用**兩階段 Migration 策略**：先加後刪，確保資料安全

**實施順序（開發環境，保留資料）**：

### **第一階段：新增功能（不破壞現有功能）**

1. **Phase 1A** → 只新增 `AlbumStat` model（不刪 `basePoints`）→ 執行 Migration
2. **Phase 2** → 實作 `updateAlbumStats` → 獨立測試驗證
3. **Phase 3** → 整合到 `completeSubmission`（暫時保留 `basePoints` 寫入）→ E2E 測試
4. **Phase 4** → 重構 `getAlbumsStats`（改用 `AlbumStats`）→ 驗證查詢效能
5. **Phase 7** → 執行 `backfillAlbumStats.ts` → 回填現有資料

**驗證點**：此時 `AlbumStats` 已正常運作，`basePoints` 仍存在但不影響功能

### **第二階段：清理舊欄位（確認新功能穩定後）**

6. **Phase 5** → 移除 `basePoints` 計算邏輯 → 驗證分數正確
7. **Phase 6** → 更新 TypeScript 類型（移除 `basePoints` 相關型別）→ TypeScript 編譯驗證
8. **Phase 1B** → 執行 Migration 刪除 `basePoints` → 驗證 Prisma 生成成功
9. **Phase 8** → 清理與最終驗證 → 準備上線

**每個 Phase 的驗證**：
- 執行 `npx tsc --noEmit`
- 執行 `npm run lint`
- 檢查資料庫資料完整性

---

## 💡 未來優化（可選）

完成基本重構後，未來可考慮：

1. **使用者設定過濾**（已討論但暫不實作）
   - 過濾 intro/interlude/reissue 歌曲
   - `UserPreference.rankingSettings` 已準備好
   - 在 `updateAlbumStats` 中根據設定過濾 TrackStats

2. **專輯統計擴展**
   - `hotStreak`：專輯排名連續上升次數
   - `coldStreak`：專輯排名連續下降次數
   - `consistency`：專輯分數波動度
   - `highestRank` / `lowestRank`：歷史最高/最低排名

3. **效能優化**
   - 使用 `db.$queryRaw` 一次查詢取得所有資料
   - 使用 Redis 快取 `getAlbumsStats` 結果
   - 使用 Database Index 優化查詢

4. **錯誤處理**
   - `updateAlbumStats` 失敗時重試機制
   - 資料不一致時警告通知

---

## 📖 參考資料

### **設計原則**
- **Single Source of Truth**：`AlbumStats` 是專輯統計的唯一真實來源
- **Symmetry**：Track 和 Album 架構對稱（Ranking + Stats）
- **Performance**：預先計算 > 即時計算（當資料穩定時）

### **Prisma 最佳實踐**
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

### **資料庫設計**
- 正規化 vs 反正規化：在查詢頻繁時選擇反正規化（預先計算）
- 索引設計：複合索引 `(userId, albumId)` 加速查詢

---

**文件版本**：v1.1
**最後更新**：2025-10-11
**狀態**：待執行

---

## 📋 修訂記錄

### v1.1 (2025-10-11)
- 🔧 調整實施順序：採用兩階段 Migration 策略（先加後刪）
- 🔧 優化 `calculatePercentileCounts`：預先計算閾值 + 只遍歷一次（效能提升 4 倍）
- 🔧 移除 `groupBy` 輔助函式（不再需要）
- ✅ 新增 `scripts/recalculateAlbumScores.ts`（重新計算所有分數）
- ✅ 明確 Migration 策略：一律使用 `migrate dev`，禁止 `db push` 和 `migrate reset`
- ✅ 確認 `updateAlbumStats` 位置：放在 `src/services/album/`（與 `updateTrackStats` 對稱）
- ✅ 確保資料庫資料不遺失（禁止 migrate reset）
- ✅ 第一階段只新增功能，不破壞現有功能
- ✅ 第二階段才清理舊欄位（確認新功能穩定後）

### v1.0 (2025-10-10)
- 初始版本
- 定義完整的重構計畫
- 包含所有 Phase 的詳細步驟
- 新增 Migration Scripts
- 新增驗證檢查清單
