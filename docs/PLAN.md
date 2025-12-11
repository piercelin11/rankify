# Next.js 15 use cache 實驗 - 快取架構優化完成報告

**日期**: 2025-12-11
**狀態**: ✅ 已完成
**評分**: 🟢 9/10 - 好品味

---

## 執行摘要

本次優化針對 Next.js 15 `use cache` 實驗性功能的快取架構進行了全面審查與修正，共修復 5 個明確的設計缺陷（1 個已提前修復），將快取架構從「湊合」提升至「好品味」等級。

---

## 快取架構設計

### 三層粗粒度標籤策略

```
第一層：USER_DYNAMIC(userId)
├── 首頁統計、歷史、Hero、Discovery
├── 已登記歌手清單
└── 使用者偏好設定

第二層：RANKING(userId, artistId)
├── 排名統計 (tracks/albums stats)
├── 提交記錄 (submissions)
└── 排名歷史 (ranking history)

第三層：ARTIST/ALBUM/TRACK(id)
└── 靜態內容資料（跨使用者共享）
```

**設計原則**:
- USER_DYNAMIC: 用戶的所有動態資料
- RANKING: 用戶+歌手的排名相關資料
- ARTIST/ALBUM/TRACK: 靜態內容資料（只在 admin 編輯時變動）

---

## 已修復問題清單

### P0 優先級（影響使用者體驗）

#### ✅ P0-1: createSubmission 快取失效
- **狀態**: 已提前修復
- **檔案**: `src/features/sorter/actions/createSubmission.ts:110`
- **修復內容**: 確認已有 `await invalidateDraftCache(userId, artistId);`

#### ✅ P0-2: getPeakRankings 缺少快取配置
- **檔案**: `src/db/ranking.ts:18`
- **問題**: 函式完全沒有 `cacheLife` 和 `cacheTag`
- **修復**: 加上快取配置
  ```typescript
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.TRACK(trackId));
  ```

#### ✅ P0-3: getAlbumComparisonOptions 標籤配置不完整
- **檔案**: `src/db/album.ts:175`
- **問題**: 只標記 `ARTIST`，但這是使用者+專輯的排名資料
- **影響**: 當使用者完成新排名時，快取不會被清除，導致顯示舊資料
- **修復**: 加上 `RANKING` 標籤
  ```typescript
  cacheTag(CACHE_TAGS.RANKING(userId, artistId));
  ```

---

### P1 優先級（程式碼品質）

#### ✅ P1-4: 移除 ADMIN_DATA 死代碼
- **檔案**:
  - `src/constants/cacheTags.ts:23`
  - `src/lib/cacheInvalidation.ts:41`
- **問題**: 定義了 `ADMIN_DATA` 標籤，但沒有任何資料庫函式使用它
- **修復**:
  1. 從 `cacheTags.ts` 刪除 `ADMIN_DATA: 'admin-data'`
  2. 從 `cacheInvalidation.ts` 刪除 `revalidateTag(CACHE_TAGS.ADMIN_DATA, 'max');`

#### ✅ P1-5: getAlbumsHistory 移除重複標籤
- **檔案**: `src/services/album/getAlbumsHistory.ts:30`
- **問題**: 同時使用 `RANKING` 和 `USER_DYNAMIC` 標籤
- **為什麼錯誤**:
  - 這是特定 submission 的歷史資料，不是「動態資料」
  - `invalidateRankingCache` 已經會失效 `RANKING` 標籤
  - 雙重標籤會造成邏輯不一致
- **修復**: 移除 `USER_DYNAMIC` 標籤，只保留 `RANKING`

#### ✅ P1-6: getTrackComparisonOptions 移除重複標籤
- **檔案**: `src/db/track.ts:146`
- **問題**: 同一個 `ARTIST` 標籤被設定兩次
- **修復**: 刪除重複的 `cacheTag(CACHE_TAGS.ARTIST(artistId));`

---

## 修改檔案清單

1. ✅ `src/db/ranking.ts` - 加快取配置
2. ✅ `src/db/album.ts` - 加 RANKING 標籤
3. ✅ `src/constants/cacheTags.ts` - 移除 ADMIN_DATA
4. ✅ `src/lib/cacheInvalidation.ts` - 移除 ADMIN_DATA 引用
5. ✅ `src/services/album/getAlbumsHistory.ts` - 移除 USER_DYNAMIC 標籤
6. ✅ `src/db/track.ts` - 移除重複標籤

---

## 快取失效邏輯

| 操作 | 失效函式 | 失效標籤 | 狀態 |
|-----|---------|---------|------|
| 完成排名 | `invalidateRankingCache` | `USER_DYNAMIC` + `RANKING` | ✅ 正確 |
| 保存草稿 | `invalidateDraftCache` | `USER_DYNAMIC` + `RANKING` | ✅ 正確 |
| 刪除草稿 | `invalidateDraftCache` | `USER_DYNAMIC` + `RANKING` | ✅ 正確 |
| 建立排名 | `invalidateDraftCache` | `USER_DYNAMIC` + `RANKING` | ✅ 正確 |
| 編輯歌手 | `invalidateAdminCache` | `ARTIST` | ✅ 正確 |
| 編輯專輯 | `invalidateAdminCache` | `ALBUM` | ✅ 正確 |
| 編輯歌曲 | `invalidateAdminCache` | `TRACK` | ✅ 正確 |

---

## 資料庫函式配置統計

檢查了 22 個函式，結果：

| 配置項 | 狀態 |
|--------|------|
| `'use cache'` 宣告 | ✅ 5/5 檔案正確 |
| 舊 `cache()` 移除 | ✅ 已完全清除 |
| `cacheLife` 配置 | ✅ 22/22 正確 |
| `cacheTag` 配置 | ✅ 22/22 正確 |

---

## 品質檢查結果

- ✅ `npm run lint` - 通過
- ✅ `npx tsc --noEmit` - 通過

---

## Linus 式設計原則評估

### 好品味的標準

**好的程式碼沒有特殊情況。**

修復前的問題：
- ❌ `getAlbumsHistory` 是唯一一個用雙標籤的查詢 → 特殊情況
- ❌ `ADMIN_DATA` 是唯一一個沒人用的標籤 → 死代碼
- ❌ `getPeakRankings` 是唯一一個沒快取的查詢 → 不一致

修復後的狀態：
- ✅ 所有查詢函式都有一致的快取配置
- ✅ 所有寫操作都有對應的快取失效
- ✅ 沒有死代碼，每個標籤都有實際用途
- ✅ 邏輯清晰，沒有特殊情況

---

## 架構優勢

1. **簡潔性** - 3 個失效函式，3 個標籤類型
2. **一致性** - 所有寫操作都有失效，所有查詢都有快取
3. **可維護性** - 沒有死代碼，每個標籤都有明確用途
4. **實用主義** - 粗粒度設計適合目前的應用規模
5. **可擴展性** - 如果未來需要更精細的控制，可以輕鬆擴展

---

## 未來優化建議

### 短期（可選）
- 考慮在 `settings` 頁面加入「專輯計分方式偏好」設定
- 如果實作此功能，需要為 `getAlbumsHistory` 加回 `USER_DYNAMIC` 標籤

### 長期（視規模而定）
- 如果使用者數量大幅增長，考慮將 `USER_DYNAMIC` 拆分為更細粒度的標籤
- 如果快取失效過於頻繁，可以引入更精細的時間控制策略

---

## 結論

**最終評分: 🟢 9/10 - 好品味**

修復後的快取系統符合 Linus Torvalds 的三個核心原則：

1. ✅ **簡潔執念 (Simplicity)** - 每個函式 5-10 行，邏輯清晰
2. ✅ **實用主義 (Pragmatism)** - 接受合理的權衡，不過度優化
3. ✅ **好品味 (Good Taste)** - 沒有特殊情況，沒有死代碼

**這就是 Linus 所說的「好品味」—— 簡單、清晰、沒有特殊情況。** 🎉
