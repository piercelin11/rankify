// Guest 排序器相關型別定義
import { TrackData } from "./data";

// Re-export TrackData for convenience
export type { TrackData };

export type GuestResultData = {
	albumId: string;
	artistId: string;
	resultState: {
		rankedList: string[]; // 最終排名 (trackId 陣列)
		completedAt: number; // 完成時間戳
	};
	tracks: TrackData[]; // 用於渲染與匯入
	expiresAt: number; // 過期時間戳 (24 小時後)
};
