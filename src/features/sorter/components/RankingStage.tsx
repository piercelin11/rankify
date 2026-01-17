"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeftIcon, ReloadIcon } from "@radix-ui/react-icons";
import useSorter from "@/features/sorter/hooks/useSorter";
import TrackBtn from "./TrackBtn";
import EqualBtn from "./EqualBtn";
import { useModal } from "@/contexts";
import { TrackData } from "@/types/data";
import { useSorterState, useSorterActions } from "@/contexts/SorterContext";
import { SorterStateType } from "@/lib/schemas/sorter";
import { StorageStrategy, WarningContext } from "../storage/StorageStrategy";
import { QuitButton } from "./QuitButton";

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
	const { showAlert } = useModal();
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
		// 使用者已確認要重新開始，設定 flag 跳過 beforeunload
		isIntentionalNavigation.current = true;
		setSaveStatus("idle");
		setPercentage(0);
		storage.delete();
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
			// 如果是有意導航 (Quit/Restart)，不攔截
			if (isIntentionalNavigation.current) {
				return;
			}

			// 完全依賴 Storage 決定
			const state: WarningContext = {
				finishFlag: finishFlag.current,
				saveStatus,
			};

			if (storage.shouldWarnBeforeLeaving(state)) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [storage, finishFlag, saveStatus]);

	return (
		<section className="flex h-[calc(100vh-80px)] select-none">
			<QuitButton
				storage={storage}
				finishFlag={finishFlag}
				isIntentionalNavigation={isIntentionalNavigation}
				onSave={async () => {
					await handleSave();
				}}
			/>
			<div className="m-auto flex-1 space-y-3 xl:space-y-6">
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
					<button
						onClick={restorePreviousState}
						className="flex w-full cursor-pointer select-none items-center justify-center gap-2 rounded-xl border bg-secondary p-2 transition-all duration-150 ease-out hover:bg-accent hover:shadow-lg sm:w-auto lg:p-5"
					>
						<ChevronLeftIcon />
						<p>Previous</p>
					</button>

					<button
						className="flex min-h-[44px] cursor-pointer select-none items-center justify-center gap-2 rounded-xl border bg-secondary p-2 transition-all duration-150 ease-out hover:bg-accent hover:shadow-lg lg:p-5"
						onClick={() =>
							showAlert({
								title: "Are You Sure?",
								description: "You will clear your sorting record.",
								confirmText: "Clear and Restart",
								onConfirm: () => handleClear(),
							})
						}
					>
						<ReloadIcon />
						<p>Restart</p>
					</button>
				</div>
			</div>
		</section>
	);
}
