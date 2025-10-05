"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import useSorter from "@/features/sorter/hooks/useSorter";
import TrackBtn from "./TrackBtn";
import EqualBtn from "./EqualBtn";
import { useModal } from "@/contexts";
import { TrackData } from "@/types/data";
import deleteSubmission from "../actions/deleteSubmission";
import { useSorterContext } from "@/contexts/SorterContext";
import { SorterStateType } from "@/lib/schemas/sorter";

type RankingStageProps = {
	initialState: SorterStateType;
	submissionId: string;
	tracks: TrackData[];
	userId: string;
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
	submissionId,
	tracks,
	userId,
}: RankingStageProps) {
	const router = useRouter();
	const { showAlert, showConfirm } = useModal();
	const { setSaveStatus, setPercentage, saveStatus } = useSorterContext();

	const [selectedButton, setSelectedButton] = useState<string | null>(null);
	const [pressedKey, setPressedKey] = useState<PressedKeyType | null>(null);

	// 從 initialState 獲取必要資訊
	const artistId = tracks[0]?.artistId;

	const {
		leftField,
		rightField,
		finishFlag,
		sortList,
		handleSave,
		restorePreviousState,
	} = useSorter({
		initialState,
		submissionId,
		tracks,
		userId,
	});

	//清除排名紀錄並重新開始
	function handleClear() {
		setSaveStatus("idle");
		setPercentage(0);
		deleteSubmission({ submissionId });
	}

	//離開排名介面
	function handleQuit() {
		setSaveStatus("idle");
		router.replace(`/artist/${artistId}/my-stats`);
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
						<Button
							variant="outline"
							onClick={() => {
								if (saveStatus === "idle")
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
								else handleQuit();
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
