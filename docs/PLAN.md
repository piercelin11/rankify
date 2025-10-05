# Album Sorter 重構計畫

## 目標

統一 Artist Sorter 與 Album Sorter 的程式碼結構，消除特殊情況，提升可維護性。

---

## 核心問題

### 問題 1：Header 的 Quit 按鈕無法存取業務邏輯

**現況**：
- Quit 按鈕位於 `RankingStage` 底部
- 需要 `handleSave` 才能正確執行（儲存 → 導航離開）
- `handleSave` 與完整 `state` 都在 `useSorter` hook 內部

**期望**：
- 將 Quit 移到 `SorterHeader`（全域操作區）
- Header 能夠安全存取 quit 邏輯

**方案**：
- 透過 `SorterContext` 暴露**原子操作**（`handleSave`、`artistId`）而非複合操作
- Header 自己組合 Quit 邏輯（Modal + 導航），保持彈性
- 使用 `useRef` 穩定化 `handleSave` 參照，避免不必要的 re-render

**為何不傳 `handleQuit`**：
- Modal 需要兩種行為：「不儲存離開」vs「儲存後離開」
- 若 `handleQuit` 包含 `handleSave`，則無法實作「不儲存離開」
- 若 `handleQuit` 不包含 `handleSave`，則需要額外暴露 `handleSave`
- **結論**：直接暴露 `handleSave` + `artistId`，讓 Header 組合邏輯更清晰

**風險與對策**：
- ⚠️ 每次 `useSorter` re-render 都會產生新的 `handleSave` → 用 `useRef` + wrapper function
- ⚠️ `artistId` 可能為空 → 從 `tracks[0]?.artistId` 取得並驗證存在性

---

### 問題 2：Artist 與 Album Sorter 初始化流程不一致

**現況**：
- **Artist Sorter**：`FilterStage` → 選擇專輯/單曲 → `createSubmission` → `RankingStage`
- **Album Sorter**：❌ 無 `FilterStage` → 無 `submission` → 無法進入 `RankingStage`

**期望**：
- Album Sorter 自動建立 submission，直接進入排序階段
- 兩種 Sorter 的核心流程統一（都從有 submission 開始）

**資料結構差異**：
| 欄位 | Artist Sorter | Album Sorter |
|------|---------------|--------------|
| `type` | `"ARTIST"` | `"ALBUM"` |
| `artistId` | ✅ | ✅ (從 Album 取得) |
| `albumId` | `null` | ✅ |
| `draftState.namMember` | 多張專輯的 tracks | 單張專輯的 tracks |

**方案**：
- 在 Album Sorter 的 `page.tsx` 檢測到無 submission 時：
  1. 取得該專輯所有 tracks（`getTracksByAlbumId`）
  2. 呼叫 `createSubmission({ type: "ALBUM", albumId, ... })`
  3. `redirect` 回當前頁面觸發 re-render

**錯誤處理**：
- `getTracksByAlbumId` 回傳空陣列 → 顯示「此專輯無歌曲」並提供返回按鈕
- `createSubmission` 失敗 → 顯示錯誤訊息，允許重試

---

## 實作任務

### 任務 1：擴充 `SorterContext` 暴露原子操作
**檔案**：[src/contexts/SorterContext.tsx](../src/contexts/SorterContext.tsx)

**變更內容**：
```typescript
type SorterContextValue = {
  saveStatus: SaveStatusType;
  percentage: number;
  setSaveStatus: (status: SaveStatusType) => void;
  setPercentage: (percentage: number) => void;
  handleSave: () => Promise<void>;  // 新增：儲存操作
  artistId: string;  // 新增：用於導航
  registerSaveHandler: (fn: () => Promise<void>, artistId: string) => void;  // 新增
};
```

**實作細節**：
```typescript
export function SorterProvider({ children }: Props) {
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>("idle");
  const [percentage, setPercentage] = useState(0);
  const [artistId, setArtistId] = useState("");  // ✅ 改用 state

  // 用 ref 儲存，避免 Context value 變化導致 re-render
  const handleSaveRef = useRef<() => Promise<void>>();

  const registerSaveHandler = useCallback((
    fn: () => Promise<void>,
    id: string
  ) => {
    handleSaveRef.current = fn;
    setArtistId(id);  // ✅ 觸發 state 更新
  }, []);

  // 提供穩定的 wrapper function
  const handleSave = useCallback(async () => {
    if (handleSaveRef.current) {
      await handleSaveRef.current();
    }
  }, []);

  const value = useMemo(() => ({
    saveStatus,
    setSaveStatus,
    percentage,
    setPercentage,
    handleSave,
    artistId,  // ✅ 現在會正確更新
    registerSaveHandler,
  }), [saveStatus, percentage, handleSave, artistId, registerSaveHandler]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
```

**重要修正**：
- `artistId` 改用 `state` 而非 `ref`，確保 Context value 正確更新
- 原因：ref 變化不會觸發 `useMemo` 重新計算，Header 會拿到過期的 `artistId`

---

### 任務 2：在 `useSorter` 註冊 `handleSave`
**檔案**：[src/features/sorter/hooks/useSorter.ts](../src/features/sorter/hooks/useSorter.ts)

**新增邏輯**：
```typescript
const { registerSaveHandler } = useSorterContext();

// 取得 artistId
const artistId = tracks[0]?.artistId ?? "";

// 穩定化 handleSave，避免 dependency 頻繁變化
const handleSaveRef = useRef(handleSave);
useEffect(() => {
  handleSaveRef.current = handleSave;
}, [handleSave]);

const stableHandleSave = useCallback(async () => {
  await handleSaveRef.current();
}, []);

// 註冊到 Context（只在 artistId 改變時觸發）
useEffect(() => {
  if (artistId) {
    registerSaveHandler(stableHandleSave, artistId);
  }
}, [artistId, registerSaveHandler, stableHandleSave]);
```

**注意事項**：
- `artistId` 必須從 `tracks[0]?.artistId` 取得，因為兩種 Sorter 都保證有 tracks
- 只有當 `artistId` 存在時才註冊，避免空字串導航問題
- **關鍵修正**：穩定化 `handleSave` 避免每次 render 都重新註冊
  - 原因：`handleSave` 內部依賴 `state`，每次 render 都會產生新函式
  - 如果直接放進 dependency array，會導致無限 re-render
  - 使用 `ref` + `useCallback` 確保只在 `artistId` 改變時才重新註冊

---

### 任務 3：從 `RankingStage` 移除 Quit 按鈕
**檔案**：[src/features/sorter/components/RankingStage.tsx](../src/features/sorter/components/RankingStage.tsx)

**移除內容**：
- `handleQuit` 函式定義
- Quit 按鈕相關的所有程式碼（Button、Modal 邏輯）
- 相關的 imports（如果不再使用）

**保留內容**：
- Restart 按鈕及其邏輯
- 所有排序互動功能

---

### 任務 4：在 `SorterHeader` 新增 Quit 按鈕
**檔案**：[src/features/sorter/components/SorterHeader.tsx](../src/features/sorter/components/SorterHeader.tsx)

**新增內容**：
```tsx
const { handleSave, saveStatus, artistId } = useSorterContext();
const router = useRouter();
const { showConfirm } = useModal();

const handleQuitClick = () => {
  const targetUrl = `/artist/${artistId}/my-stats`;

  if (saveStatus === "idle") {
    showConfirm({
      title: "Are You Sure?",
      description: "Your sorting record has not been saved.",
      confirmText: "Quit",
      cancelText: "Save",
      onConfirm: () => {
        // Quit WITHOUT save
        router.replace(targetUrl);
      },
      onCancel: async () => {
        // Save THEN quit
        await handleSave();
        router.replace(targetUrl);
      },
    });
  } else {
    // Already saved, just quit
    router.replace(targetUrl);
  }
};
```

**UI 位置**：
- 放在 Progress bar 右側（使用 Button variant="ghost" + XIcon）

**需要的 imports**：
```tsx
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModal";
```

---

### 任務 5：新增 `getTracksByAlbumId` 函式
**檔案**：[src/db/track.ts](../src/db/track.ts)

**實作內容**：
```typescript
export async function getTracksByAlbumId({ albumId }: { albumId: string }) {
  const tracks = await db.track.findMany({
    where: { albumId },
    include: {
      artist: true,
      album: true,
    },
    orderBy: [
      { discNumber: "asc" },
      { trackNumber: "asc" },
    ],
  });

  return tracks;
}
```

**為何不改寫 `getTracksByAlbumAndTrackIds`**：
- 職責不同：該函式處理「OR 邏輯」（專輯 OR 單曲）
- 新函式語意清晰：純粹取得一張專輯的所有歌曲
- 向後相容：不影響現有 Artist Sorter 流程

---

### 任務 6：實作 Album Sorter 自動建立 Submission
**檔案**：[src/app/sorter/album/[albumId]/page.tsx](../src/app/sorter/album/[albumId]/page.tsx)

**實作邏輯**：
```typescript
export default async function page({ params }: pageProps) {
  const { albumId } = await params;
  const { id: userId } = await getUserSession();

  // 1. 取得專輯資訊（用於 artistId）
  const album = await getAlbumById({ albumId });
  if (!album) notFound();

  // 2. 檢查是否有未完成的 submission
  const submission = await getIncompleteRankingSubmission({
    artistId: album.artistId,
    userId,
    type: "ALBUM",
    albumId,
  });

  // 3. 如果沒有，自動建立
  if (!submission) {
    const tracks = await getTracksByAlbumId({ albumId });

    if (tracks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg">此專輯無歌曲資料</p>
          <Link href={`/album/${albumId}`}>
            <Button className="mt-4">返回專輯頁面</Button>
          </Link>
        </div>
      );
    }

    await createSubmission({
      selectedAlbumIds: [albumId],
      selectedTrackIds: tracks.map(t => t.id),
      type: "ALBUM",
      artistId: album.artistId,
      albumId,
    });

    redirect(`/sorter/album/${albumId}`);
  }

  // 4. 從 submission 取得 tracks，避免重複查詢
  const validation = sorterStateSchema.safeParse(submission.draftState);
  if (!validation.success) {
    throw new Error("Invalid submission state");
  }

  const tracks = validation.data.namMember;  // 已包含完整 track 資料

  // 5. 渲染 Sorter UI
  return <SorterClient tracks={tracks} submission={submission} />;
}
```

**重要優化**：
- ❌ **錯誤做法**：在 `if (!submission)` 後再次執行 `getTracksByAlbumId`
- ✅ **正確做法**：從 `submission.draftState.namMember` 取得 tracks
- **原因**：redirect 後會重新執行 function，第二次查詢是多餘的

**錯誤處理**：
- 無歌曲 → 顯示錯誤 UI + 返回按鈕
- `createSubmission` 失敗 → 自動拋出錯誤，由 Next.js error boundary 處理
- `draftState` 格式錯誤 → 呼叫 `notFound()`

---

## 執行順序與檢查清單

### Phase 1：Context 與 Hook 層（問題 1 核心）
- [ ] **任務 1**：擴充 `SorterContext` 暴露 `handleSave` 與 `artistId`
- [ ] **任務 2**：在 `useSorter` 註冊 `handleSave` 到 Context
- [ ] 執行 `npx tsc --noEmit` 檢查型別錯誤

### Phase 2：UI 層重構（問題 1 UI）
- [ ] **任務 3**：從 `RankingStage` 移除 Quit 按鈕
- [ ] **任務 4**：在 `SorterHeader` 新增 Quit 按鈕（含完整 Modal 邏輯）
- [ ] 執行 `npm run lint` 檢查

### Phase 3：資料層與流程統一（問題 2）
- [ ] **任務 5**：新增 `getTracksByAlbumId` 函式
- [ ] **任務 6**：實作 Album Sorter 自動建立 Submission
- [ ] 執行 `npx tsc --noEmit` 與 `npm run lint`

### Phase 4：整合測試
- [ ] **測試 Artist Sorter Quit 按鈕**
  1. 進入 Artist Sorter
  2. 點擊幾次排序（saveStatus 變成 "idle"）
  3. 點擊 Header 的 Quit → 應該跳出 Modal
  4. 測試「Quit」→ 應該不儲存直接離開
  5. 重新進入 → 應該回到上次儲存的進度
  6. 測試「Save」→ 應該儲存後離開
  7. 重新進入 → 應該顯示最新進度

- [ ] **測試 Album Sorter 自動初始化**
  1. 清除該 album 的所有 submissions（或用新 album）
  2. 訪問 `/sorter/album/{albumId}`
  3. 應該自動建立 submission 並進入排序頁面
  4. 檢查 tracks 順序是否正確（依 discNumber, trackNumber）
  5. 點擊 Quit 按鈕，確認 Modal 邏輯正常

- [ ] **測試邊界情況**
  1. 測試無歌曲專輯 → 應顯示錯誤訊息與返回按鈕
  2. 測試 Header Quit 在 saveStatus="saving" 時的行為
  3. 驗證 `artistId` 為空時不會註冊到 Context

---

## 預期成果

### 1. 統一操作介面
- Artist 與 Album Sorter 的 Header 功能一致（都有 Quit 按鈕）
- 操作流程一致：儲存確認 → 導航離開

### 2. 消除特殊情況
- Artist Sorter：`FilterStage` → `createSubmission` → `RankingStage`
- Album Sorter：自動 `createSubmission` → `RankingStage`
- **統一點**：進入 `RankingStage` 前都保證有 `submission`

### 3. 職責清晰
- **Header**：全域操作（Quit、進度顯示）
- **RankingStage**：排序互動（Previous、Restart）
- **useSorter**：業務邏輯（排序演算法、自動儲存）

### 4. 效能優化
- 使用 `useRef` 儲存 `handleSave` 與 `artistId`，避免 Context 頻繁更新
- Album Sorter 避免重複查詢 tracks（從 `submission.draftState` 取得）

---

## 潛在風險與緩解措施

### 風險 1：Context re-render 效能問題
- **問題**：每次 `useSorter` re-render 都會產生新的 `handleSave`
- **緩解**：使用 `useRef` 儲存函式，只暴露穩定的 wrapper function
- **驗證**：用 React DevTools 觀察 Context value 是否頻繁變化

### 風險 2：Album Sorter redirect 造成無限循環
- **問題**：`createSubmission` → `redirect` → 再次進入 function → 無 submission → 又 create
- **緩解**：`createSubmission` 成功後才 redirect，第二次進入時 `submission` 必然存在
- **驗證**：確認只呼叫一次 `createSubmission`（用 console.log 或 DB 記錄）

### 風險 3：Modal 邏輯不一致
- **問題**：Header 的 Quit Modal 與原本 RankingStage 的邏輯不同
- **緩解**：Header 完整實作「Quit without save」與「Save then quit」兩種流程
- **驗證**：Phase 4 測試時比對兩種 Sorter 的行為是否一致

### 風險 4：getTracksByAlbumId 回傳空陣列
- **問題**：空陣列導致 `createSubmission` 失敗或排序頁面 crash
- **緩解**：明確檢查 `tracks.length === 0`，顯示友善錯誤 UI
- **驗證**：建立一個無歌曲的測試專輯，確認錯誤處理正常

### 風險 5：artistId 為空字串
- **問題**：`tracks[0]?.artistId` 可能為 `undefined`，導致導航錯誤
- **緩解**：只在 `artistId` 存在時才註冊到 Context，Header 使用前檢查非空
- **驗證**：Phase 4 測試邊界情況時確認不會導航到 `/artist//my-stats`

### 風險 6：跨 Sorter 的 handleSave 污染
- **問題**：從 Artist A Sorter 切換到 Artist B Sorter 時，Context 可能仍保留舊的 `handleSave_A`
- **場景**：
  1. 進入 Artist A Sorter → 註冊 `handleSave_A`
  2. 點擊 Quit 離開（Context Provider 不 unmount）
  3. 進入 Artist B Sorter → 如果 `useEffect` 沒觸發，仍使用 `handleSave_A`
  4. 點擊 Save → 儲存到錯誤的 Artist ❌
- **緩解**：
  - 穩定化 `handleSave`：用 `ref` + `useCallback` 避免每次 render 都重新註冊
  - 確保 `artistId` 改變時必定重新註冊（放入 dependency array）
  - `artistId` 來源穩定（`tracks[0]?.artistId`），不同 Sorter 必定不同
- **驗證**：
  1. 進入 Artist A Sorter，檢查 `artistId` = A
  2. 離開後進入 Artist B Sorter，檢查 `artistId` = B
  3. 點擊 Save，確認儲存到 B 而非 A
