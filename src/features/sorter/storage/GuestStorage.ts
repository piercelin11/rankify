import { StorageStrategy, Capabilities } from "./StorageStrategy";
import { SorterStateType } from "@/lib/schemas/sorter";
import { TrackData } from "@/types/data";
import { RankingResultData } from "../types";

/**
 * Guest 儲存策略
 *
 * 使用 LocalStorage 儲存排序結果 (24 小時過期)
 * 不支援自動儲存、重新開始、刪除等功能
 */
export class GuestStorage implements StorageStrategy {
	private albumId: string;
	private artistId: string;
	private showAuthGuard: (params: { callbackUrl: string }) => void;

	constructor(
		albumId: string,
		artistId: string,
		showAuthGuard: (params: { callbackUrl: string }) => void
	) {
		this.albumId = albumId;
		this.artistId = artistId;
		this.showAuthGuard = showAuthGuard;
	}

	async save(_state: SorterStateType): Promise<void> {
		// Guest 不支援自動儲存
		return Promise.resolve();
	}

	async finalize(state: SorterStateType, tracks: TrackData[]): Promise<void> {
		// 從 state.namMember 生成 trackId 陣列
		const rankedList = state.namMember
			.map((trackName) => tracks.find((t) => t.name === trackName)?.id || "")
			.filter(Boolean);

		// 建立 Guest 結果資料
		const guestData = {
			albumId: this.albumId,
			artistId: this.artistId,
			resultState: {
				rankedList,
				completedAt: Date.now(),
			},
			tracks,
			expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 小時後過期
		};

		// 寫入 LocalStorage
		localStorage.setItem(
			`rankify_guest_result_${this.albumId}`,
			JSON.stringify(guestData)
		);

		// 重新載入頁面以顯示結果
		window.location.reload();
	}

	async delete(): Promise<void> {
		// Guest 不支援刪除
		throw new Error("Guest mode does not support delete");
	}

	async submitResult(_result: RankingResultData[]): Promise<void> {
		// 觸發登入引導,帶上 migrate=true 參數
		this.showAuthGuard({
			callbackUrl: `/sorter/album/${this.albumId}?migrate=true`,
		});
	}

	getInitialSaveStatus(): "idle" {
		return "idle";
	}

	readonly capabilities: Capabilities = {
		canRestart: false,
		canDelete: false,
		canAutoSave: false,
		needsBeforeUnload: false, // Guest 離開不會遺失資料 (已存 LocalStorage)
	};

	quit(): void {
		// 觸發登入引導
		this.showAuthGuard({
			callbackUrl: `/sorter/album/${this.albumId}`,
		});
	}
}
