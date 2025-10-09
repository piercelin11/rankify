import { useRef, useCallback, useEffect } from 'react';
import type { SorterStateType } from '@/lib/schemas/sorter';
import saveDraft from '../actions/saveDraft';
import type { SaveStatusType } from '@/contexts/SorterContext';

type UseAutoSaveParams = {
	submissionId: string;
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
 */
export function useAutoSave({
	submissionId,
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
	const executeSave = useCallback(async (state: SorterStateType) => {
		setSaveStatus('pending');

		try {
			const result = await saveDraft(state, submissionId);

			if (result.type === 'error') {
				console.error('Auto-save failed:', result.message);
				setSaveStatus('failed');
			} else {
				setSaveStatus('saved');
			}
		} catch (error) {
			console.error('Auto-save error:', error);
			setSaveStatus('failed');
		}
	}, [submissionId, setSaveStatus]);

	// 觸發自動儲存（由 sortList 呼叫）
	const triggerAutoSave = useCallback((state: SorterStateType) => {
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
	}, [executeSave, debounceDelay, maxInterval]);

	return triggerAutoSave;
}
