# 待 Claude 處理的任務清單

## 1. 審查程式碼
- **分支**: `feat/achievement-overview-card`
- **目標**:
  - [ ] 檢查安全性：是否有潛在的 SQL Injection 或密碼洩漏風險？
  - [ ] 程式碼可讀性：變數命名是否清晰？函式是否過於冗長？
  - [ ] 與原先數據計算規則有無不符合邏輯的差異？
  - [ ] 效能問題：是否有`src/services/album/updateAlbumStats.ts`和`src/services/track/updateTrackStats.ts`的效能、計算邏輯、程式碼可讀性是否有優化空間？
- **想問 Claude 的具體問題**:
  - `src/services/album/updateAlbumStats.ts`和`src/services/track/updateTrackStats.ts`的`submissionCount`欄位的計算方式是不同的，兩者差異？兩者的計算方式是否合乎邏輯？假設使用者在完成排名送出後，該次排名並無包含某張之前排名過的專輯，這樣`submissionCount`是否就不會+1了？

  ## 2. 審查`RankingResultData`型別的定義程
  - **分支**: `feat/achievement-overview-card`
  - **目標**:
    - [ ] 理解`src/features/sorter/types.ts`中的`RankingResultData`型別
    - [ ] 判斷是否將 `ranking` 欄位改為 `rank` 來跟其他型別命名統一？
    - [ ] 使否移除型別繼承，透過研究呼叫過`RankingResultData`的檔案，決定其型別明確該有什麼欄位？
    

