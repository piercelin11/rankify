import { useRef, useCallback, useEffect } from 'react';
import type { SorterStateType } from '@/lib/schemas/sorter';
import type { SaveStatusType } from '@/contexts/SorterContext';

// 只在開發環境啟用 Debug Log
const DEBUG_AUTOSAVE = process.env.NEXT_PUBLIC_DEBUG_AUTOSAVE === 'true';

type UseAutoSaveParams = {
	enabled: boolean;
	onSave: (state: SorterStateType) => Promise<void>;
	setSaveStatus: (status: SaveStatusType) => void;
	debounceDelay?: number;  // 預設 10 秒
	maxInterval?: number;    // 預設 2 分鐘
};

/**
 * Sorter 專用自動儲存 Hook
 *
 * 行為:
 * - 使用者停止點擊 10 秒後 → 自動儲存
 * - 連續點擊超過 2 分鐘 → 強制儲存
 * - Guest 模式下不啟用 (enabled=false)
 */
export function useAutoSave({
	enabled,
	onSave,
	setSaveStatus,
	debounceDelay = 10 * 1000,
	maxInterval = 2 * 60 * 1000,
}: UseAutoSaveParams) {
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const maxIntervalTimerRef = useRef<NodeJS.Timeout | null>(null);
	const latestStateRef = useRef<SorterStateType | null>(null);

	// 清理計時器
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
			if (maxIntervalTimerRef.current) clearTimeout(maxIntervalTimerRef.current);
		};
	}, []);

	// 實際執行儲存
	const executeSave = useCallback(async (stateToSave: SorterStateType) => {
		// ============================================================
		// 開發者模式：追蹤 autoSave 的時序
		// ============================================================
		// 用途：驗證 race condition 修復是否有效
		//
		// 啟用方式：
		//   在 .env.local 加入：
		//   NEXT_PUBLIC_DEBUG_AUTOSAVE=true
		//
		// 輸出範例：
		//   [AutoSave 1736812345678] Started with 42 items
		//   [AutoSave 1736812345678] Skipped (new changes detected)
		//
		// 說明：
		//   - "Skipped" 表示儲存完成時，使用者又操作了
		//   - "Saved" 表示成功儲存且無新變更
		// ============================================================
		const saveId = DEBUG_AUTOSAVE ? Date.now() : null;

		if (saveId) {
			console.log(
				`[AutoSave ${saveId}] Started with ${stateToSave.namMember.length} items`
			);
		}

		setSaveStatus('pending');

		try {
			await onSave(stateToSave);

			// 儲存完成前檢查：是否有新的變更？
			// 如果 latestStateRef 已經不等於 stateToSave，代表使用者又點擊了
			const hasNewChanges = latestStateRef.current !== stateToSave;

			if (saveId) {
				console.log(
					`[AutoSave ${saveId}] ${
						hasNewChanges
							? 'Skipped (new changes detected)'
							: 'Saved successfully'
					}`
				);
			}

			if (!hasNewChanges) {
				setSaveStatus('saved');
			}
			// 否則保持當前狀態（由下一次 sortList 設定）
		} catch (error) {
			if (saveId) {
				console.error(`[AutoSave ${saveId}] Failed:`, error);
			} else {
				console.error('Auto-save error:', error);
			}
			setSaveStatus('failed');
		}
	}, [onSave, setSaveStatus]);

	// 觸發自動儲存（由 sortList 呼叫）
	const triggerAutoSave = useCallback((state: SorterStateType) => {
		// 若不啟用自動儲存，直接返回
		if (!enabled) return;

		// 保存最新狀態
		latestStateRef.current = state;

		// 清除舊的 debounce 計時器
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// 如果是首次觸發，啟動最大間隔計時器
		if (!maxIntervalTimerRef.current) {
			maxIntervalTimerRef.current = setTimeout(() => {
				if (latestStateRef.current) {
					executeSave(latestStateRef.current);
				}
				maxIntervalTimerRef.current = null;

				// 清除 debounce 計時器（因為已經儲存了）
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
					debounceTimerRef.current = null;
				}
			}, maxInterval);
		}

		// 設定 debounce 計時器
		debounceTimerRef.current = setTimeout(() => {
			if (latestStateRef.current) {
				executeSave(latestStateRef.current);
			}

			// 清除最大間隔計時器（因為已經儲存了）
			if (maxIntervalTimerRef.current) {
				clearTimeout(maxIntervalTimerRef.current);
				maxIntervalTimerRef.current = null;
			}
		}, debounceDelay);
	}, [enabled, executeSave, debounceDelay, maxInterval]);

	return triggerAutoSave;
}
