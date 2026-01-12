import { GuestResultData } from "@/types/guest";

/**
 * 取得所有 Guest 的排序結果 (從 LocalStorage)
 * 用於 Migration 頁面批次匯入
 */
export function getAllGuestResults(): Array<{
	key: string;
	data: GuestResultData;
}> {
	const results: Array<{ key: string; data: GuestResultData }> = [];

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && key.startsWith("rankify_guest_result_")) {
			try {
				const rawData = localStorage.getItem(key);
				if (rawData) {
					const data = JSON.parse(rawData) as GuestResultData;

					// 檢查是否過期 (24 小時)
					if (Date.now() <= data.expiresAt) {
						results.push({ key, data });
					} else {
						// 過期資料直接清除
						localStorage.removeItem(key);
					}
				}
			} catch (error) {
				console.error(`Failed to parse guest data for key: ${key}`, error);
				// 解析失敗,清除無效資料
				localStorage.removeItem(key);
			}
		}
	}

	return results;
}
