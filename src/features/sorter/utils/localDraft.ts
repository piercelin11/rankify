import { SorterStateType } from "@/lib/schemas/sorter";

export type LocalDraft = {
	savedAt: string; // ISO 8601 格式的 UTC 時間字串
	state: SorterStateType;
}

/**
 * 儲存草稿到 localStorage
 */
export function saveDraftToLocalStorage(
	state: SorterStateType,
	userId: string,
	submissionId: string
): void {
	try {
		const dataToStore: LocalDraft = {
			savedAt: new Date().toISOString(),
			state: state,
		};
		const key = `ranking-draft-${userId}-${submissionId}`;
		localStorage.setItem(key, JSON.stringify(dataToStore));
	} catch (error) {
		console.warn("Failed to save draft to localStorage:", error);
		// localStorage 可能已滿或被禁用，靜默失敗
	}
}

/**
 * 從 localStorage 載入草稿
 */
export function loadDraftFromLocalStorage(
	userId: string,
	submissionId: string
): LocalDraft | null {
	try {
		const key = `ranking-draft-${userId}-${submissionId}`;
		const stored = localStorage.getItem(key);
		if (!stored) return null;

		const parsed = JSON.parse(stored) as LocalDraft;
		// 基本驗證
		if (!parsed.savedAt || !parsed.state) return null;

		return parsed;
	} catch (error) {
		console.warn("Failed to load draft from localStorage:", error);
		return null;
	}
}

/**
 * 清除本地草稿
 */
export function clearLocalDraft(userId: string, submissionId: string): void {
	try {
		const key = `ranking-draft-${userId}-${submissionId}`;
		localStorage.removeItem(key);
	} catch (error) {
		console.warn("Failed to clear local draft:", error);
	}
}

/**
 * 清理過期的本地草稿（超過一週）
 */
export function cleanupExpiredDrafts(): void {
	try {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const keysToRemove: string[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('ranking-draft-')) {
				try {
					const stored = localStorage.getItem(key);
					if (stored) {
						const parsed = JSON.parse(stored) as LocalDraft;
						const savedAt = new Date(parsed.savedAt);
						if (savedAt < oneWeekAgo) {
							keysToRemove.push(key);
						}
					}
				} catch {
					// 如果解析失敗，也標記為刪除
					keysToRemove.push(key);
				}
			}
		}

		keysToRemove.forEach(key => localStorage.removeItem(key));
	} catch (error) {
		console.warn("Failed to cleanup expired drafts:", error);
	}
}