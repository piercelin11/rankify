import { SorterStateType } from "@/lib/schemas/sorter";
import { TrackData } from "@/types/data";
import { RankingResultData } from "../types";

/**
 * UI 能力標記
 * 用於控制元件的行為和可見性
 */
export interface Capabilities {
	/** 是否顯示 Restart 按鈕 */
	canRestart: boolean;
	/** 是否顯示 Delete 按鈕 */
	canDelete: boolean;
	/** 是否啟用自動儲存 */
	canAutoSave: boolean;
	/** 是否需要 beforeunload 警告 */
	needsBeforeUnload: boolean;
}

/**
 * 儲存策略介面
 *
 * 定義 Guest 和 User 模式的統一儲存操作
 * 用於消除 `if (isGuest)` 分支邏輯
 * @example
 * ```typescript
 * // Guest 模式
 * const storage = new GuestStorage(albumId, artistId, showAuthGuard);
 *
 * // User 模式
 * const storage = new DatabaseStorage(submissionId, artistId, router, setSaveStatus);
 *
 * // 統一使用
 * await storage.save(state);
 * await storage.finalize(state, tracks);
 * ```
 */
export interface StorageStrategy {
	/**
	 * 儲存進度 (對應 auto-save)
	 * Guest: 不執行任何操作 (no-op)
	 * User: 呼叫 saveDraft Server Action
	 */
	save(state: SorterStateType): Promise<void>;

	/**
	 * 完成排序
	 * Guest: 寫入 LocalStorage + reload
	 * User: 呼叫 finalizeDraft Server Action
	 */
	finalize(state: SorterStateType, tracks: TrackData[]): Promise<void>;

	/**
	 * 刪除草稿
	 * Guest: 不支援 (throw Error)
	 * User: 呼叫 deleteSubmission Server Action
	 */
	delete(): Promise<void>;

	/**
	 * 提交結果
	 * Guest: 觸發登入引導 (帶上 migrate=true 參數)
	 * User: 呼叫 completeSubmission Server Action + router.push
	 */
	submitResult(result: RankingResultData[]): Promise<void>;

	/**
	 * 取得初始 SaveStatus
	 * Guest: 'idle' (永不自動儲存)
	 * User: 'saved' (草稿來自資料庫)
	 */
	getInitialSaveStatus(): "saved" | "idle";

	/**
	 * UI 能力標記
	 * 用於控制 Restart/Delete 按鈕可見性、自動儲存、beforeunload 警告等
	 */
	readonly capabilities: Capabilities;

	/**
	 * 使用者離開時的行為
	 * Guest: 觸發登入引導
	 * User: 正常導航到 artist 頁面
	 */
	quit(): void;
}
