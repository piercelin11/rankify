import { StorageStrategy, Capabilities } from "./StorageStrategy";
import { SorterStateType } from "@/lib/schemas/sorter";
import { TrackData } from "@/types/data";
import { RankingResultData } from "../types";
import saveDraft from "../actions/saveDraft";
import finalizeDraft from "../actions/finalizeDraft";
import deleteSubmission from "../actions/deleteSubmission";
import completeSubmission from "../actions/completeSubmission";

type Router = { replace: (url: string) => void; push: (url: string) => void };
type SetSaveStatus = (status: "saved" | "pending" | "failed" | "idle") => void;

/**
 * Database 儲存策略
 *
 * 使用 Server Actions 將資料儲存到資料庫
 * 支援自動儲存、重新開始、刪除等完整功能
 */
export class DatabaseStorage implements StorageStrategy {
	private submissionId: string;
	private artistId: string;
	private router: Router;
	private setSaveStatus: SetSaveStatus;

	constructor(
		submissionId: string,
		artistId: string,
		router: Router,
		setSaveStatus: SetSaveStatus
	) {
		this.submissionId = submissionId;
		this.artistId = artistId;
		this.router = router;
		this.setSaveStatus = setSaveStatus;
	}

	async save(state: SorterStateType): Promise<void> {
		this.setSaveStatus("pending");
		const result = await saveDraft(state, this.submissionId);
		this.setSaveStatus(result.type === "error" ? "failed" : "saved");
	}

	async finalize(state: SorterStateType, _tracks: TrackData[]): Promise<void> {
		await finalizeDraft(state, this.submissionId);
	}

	async delete(): Promise<void> {
		await deleteSubmission({ submissionId: this.submissionId });
	}

	async submitResult(result: RankingResultData[]): Promise<void> {
		await completeSubmission({
			trackRankings: result,
			submissionId: this.submissionId,
		});
		this.router.push(`/artist/${this.artistId}/${this.submissionId}`);
	}

	getInitialSaveStatus(): "saved" {
		return "saved";
	}

	readonly capabilities: Capabilities = {
		canRestart: true,
		canDelete: true,
		canAutoSave: true,
		needsBeforeUnload: true, // User 離開時需警告 (資料可能未儲存)
	};

	quit(): void {
		// 正常導航到 artist 頁面
		this.router.replace(`/artist/${this.artistId}`);
	}
}
