"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts";
import { useSorterState } from "@/contexts/SorterContext";
import { StorageStrategy } from "../storage/StorageStrategy";

type QuitButtonProps = {
	storage: StorageStrategy;
	finishFlag: React.MutableRefObject<number>;
	isIntentionalNavigation: React.MutableRefObject<boolean>;
	onSave?: () => Promise<void>;
};

/**
 * 統一的 Quit 按鈕（浮在左上角）
 *
 * 職責：
 * - 統一 Guest/User 的離開邏輯
 * - 依賴 Storage Strategy 決定警告行為
 * - 用 canAutoSave 判斷是否提供 Save 選項（YAGNI 原則）
 */
export function QuitButton({
	storage,
	finishFlag,
	isIntentionalNavigation,
	onSave,
}: QuitButtonProps) {
	const { showAlert, showConfirm } = useModal();
	const { saveStatus } = useSorterState();

	const handleQuit = () => {
		isIntentionalNavigation.current = true;
		storage.quit();
	};

	const handleClick = async () => {
		const state = {
			finishFlag: finishFlag.current,
			saveStatus,
		};

		// 檢查是否需要警告
		if (!storage.shouldWarnBeforeLeaving(state)) {
			handleQuit();
			return;
		}

		const warning = storage.getLeaveWarning();

		// 檢查是否有儲存能力（用 canAutoSave 判斷 - YAGNI 原則）
		// 有自動儲存功能 = 有儲存功能 → 提供 Save 選項
		if (storage.capabilities.canAutoSave) {
			// 有儲存功能 → showConfirm（提供 Save 選項）
			showConfirm({
				title: warning.title,
				description: warning.description,
				confirmText: warning.confirmText,
				cancelText: "Save",
				onConfirm: handleQuit,
				onCancel: async () => {
					await onSave?.();
					handleQuit();
				},
			});
		} else {
			// 沒有儲存功能 → showAlert（只有 Quit）
			showAlert({
				title: warning.title,
				description: warning.description,
				confirmText: warning.confirmText,
				onConfirm: handleQuit,
			});
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleClick}
			className="fixed left-4 top-24 z-40 h-11 w-11 rounded-full bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground transition-all hover:scale-105 active:scale-95"
			aria-label="Quit sorter"
		>
			<X className="h-5 w-5" />
		</Button>
	);
}
