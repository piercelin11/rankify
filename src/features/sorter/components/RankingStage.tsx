"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import useSorter from "@/features/sorter/hooks/useSorter";
import TrackBtn from "./TrackBtn";
import EqualBtn from "./EqualBtn";
import { useModal } from "@/contexts";
import { TrackData } from "@/types/data";
import { useSorterState, useSorterActions } from "@/contexts/SorterContext";
import { SorterStateType } from "@/lib/schemas/sorter";
import { StorageStrategy } from "../storage/StorageStrategy";

type RankingStageProps = {
	initialState: SorterStateType;
	tracks: TrackData[];
	storage: StorageStrategy;
};

type PressedKeyType = "ArrowLeft" | "ArrowRight" | "ArrowDown" | "ArrowUp";

// 鍵盤對應表
const keyMap = {
	ArrowLeft: { action: -1 as const, pressedKey: "ArrowLeft" as const },
	ArrowRight: { action: 1 as const, pressedKey: "ArrowRight" as const },
	ArrowUp: { action: 0 as const, pressedKey: "ArrowUp" as const },
	ArrowDown: { action: 0 as const, pressedKey: "ArrowDown" as const },
} as const;

export default function RankingStage({
	initialState,
	tracks,
	storage,
}: RankingStageProps) {
	const { showAlert, showConfirm } = useModal();
	const { setSaveStatus, setPercentage } = useSorterActions();
	const { saveStatus } = useSorterState();

	const [selectedButton, setSelectedButton] = useState<string | null>(null);
	const [pressedKey, setPressedKey] = useState<PressedKeyType | null>(null);

	// 追蹤是否為有意導航 (Quit/Restart 按鈕)
	const isIntentionalNavigation = useRef(false);

	const {
		leftField,
		rightField,
		finishFlag,
		sortList,
		handleSave,
		restorePreviousState,
	} = useSorter({
		initialState,
		tracks,
		storage,
	});

	//清除排名紀錄並重新開始
	function handleClear() {
		if (!storage.capabilities.canRestart) return;

		// 使用者已確認要重新開始，設定 flag 跳過 beforeunload
		isIntentionalNavigation.current = true;
		setSaveStatus("idle");
		setPercentage(0);
		storage.delete(); // 同步操作，會立即完成並導航
	}

	//離開排名介面
	function handleQuit() {
		// 使用者已確認要離開，設定 flag 跳過 beforeunload
		isIntentionalNavigation.current = true;
		setSaveStatus("idle");
		storage.quit(); // 會立即導航
	}

	// 處理選擇反饋效果
	const handleSelectFeedback = useCallback(
		(buttonId: string, action: number) => {
			setSelectedButton(buttonId);
			setTimeout(() => setSelectedButton(null), 200);
			if (finishFlag.current === 0) sortList(action);
		},
		[finishFlag, sortList]
	);

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		const keyConfig = keyMap[e.key as keyof typeof keyMap];
		if (keyConfig) {
			setPressedKey(keyConfig.pressedKey);
		}
	}, []);

	const handleKeyUp = useCallback(
		(e: KeyboardEvent) => {
			const keyConfig = keyMap[e.key as keyof typeof keyMap];
			if (keyConfig && finishFlag.current === 0) {
				sortList(keyConfig.action);
				setPressedKey(null);
			}
		},
		[finishFlag, sortList]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return function cleanup() {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [handleKeyDown, handleKeyUp]);

	// beforeunload 警告：防止意外關閉導致資料遺失
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			// 只有 User 模式才需要 beforeunload 警告
			if (!storage.capabilities.needsBeforeUnload) {
				return; // Guest 模式直接返回，不警告
			}

			// 如果是有意導航 (Quit/Restart)，不攔截
			if (isIntentionalNavigation.current) {
				return;
			}

			// 只在意外關閉時警告
			const shouldWarn = saveStatus !== "saved";

			if (shouldWarn) {
				e.preventDefault();
				e.returnValue = ''; // Chrome 需要設定 returnValue
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [storage.capabilities.needsBeforeUnload, saveStatus]);

	return (
		<section className="flex h-[calc(100vh-80px)] select-none">
			<div className="m-auto flex-1 space-y-6">
				<div className="grid grid-cols-2 grid-rows-[150px_75px_150px] gap-3 sm:grid-flow-col sm:grid-cols-3 sm:grid-rows-2 xl:gap-6">
					<TrackBtn
						isPressed={pressedKey === "ArrowLeft"}
						isSelected={selectedButton === "left"}
						onClick={() => handleSelectFeedback("left", -1)}
						data={leftField}
					/>
					<EqualBtn
						isPressed={pressedKey === "ArrowUp"}
						isSelected={selectedButton === "like-both"}
						onClick={() => handleSelectFeedback("like-both", 0)}
					>
						i like both
					</EqualBtn>
					<EqualBtn
						isPressed={pressedKey === "ArrowDown"}
						isSelected={selectedButton === "no-opinion"}
						onClick={() => handleSelectFeedback("no-opinion", 0)}
					>
						no opinion
					</EqualBtn>
					<TrackBtn
						isPressed={pressedKey === "ArrowRight"}
						isSelected={selectedButton === "right"}
						onClick={() => handleSelectFeedback("right", 1)}
						data={rightField}
					/>
				</div>

				<div className="flex justify-between gap-3">
					<Button variant="outline" onClick={restorePreviousState}>
						<ChevronLeftIcon />
						<p>Previous</p>
					</Button>

					<div className="flex gap-3 xl:gap-6">
						{storage.capabilities.canRestart && (
							<Button
								variant="outline"
								onClick={() =>
									showAlert({
										title: "Are You Sure?",
										description: "You will clear your sorting record.",
										confirmText: "Clear and Restart",
										onConfirm: () => handleClear(),
									})
								}
							>
								Restart
							</Button>
						)}
						<Button
							variant="outline"
							onClick={() => {
								if (storage.capabilities.canAutoSave) {
									// User 模式: 有草稿功能,可以 Save
									if (saveStatus === "idle") {
										showConfirm({
											title: "Are You Sure?",
											description: "Your sorting record has not been saved.",
											confirmText: "Quit",
											cancelText: "Save",
											onConfirm: () => handleQuit(),
											onCancel: async () => {
												await handleSave();
												handleQuit();
											},
										});
									} else {
										handleQuit();
									}
								} else {
									// Guest 模式: 沒有草稿功能,只有確認退出
									showAlert({
										title: "Are You Sure?",
										description: "Your ranking progress will be lost",
										confirmText: "Quit",
										onConfirm: () => handleQuit(),
									});
								}
							}}
						>
							Quit
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
