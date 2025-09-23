"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { RankingDraftData, TrackData } from "@/types/data";
import deleteRankingDraft from "../../ranking/actions/deleteRankingDraft";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	setPercentage,
	setSaveStatus,
} from "@/features/sorter/slices/sorterSlice";
import { Button } from "@/components/ui/button";
import { CurrentStage } from "./SorterPage";
import useSorter from "@/features/sorter/hooks/useSorter";
import TrackBtn from "./TrackBtn";
import EqualBtn from "./EqualBtn";
import { useModal } from "@/lib/hooks/useModal";

export type RankingResultData = TrackData & {
	ranking: number;
};

type SortingStageProps = {
	data: TrackData[];
	draft: RankingDraftData | null;
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
	rankingType?: "artist" | "album";
	albumId?: string;
};

type PressedKeyType = "ArrowLeft" | "ArrowRight" | "ArrowDown" | "ArrowUp";

// 鍵盤對應表
const keyMap = {
	ArrowLeft: { action: -1 as const, pressedKey: "ArrowLeft" as const },
	ArrowRight: { action: 1 as const, pressedKey: "ArrowRight" as const },
	ArrowUp: { action: 0 as const, pressedKey: "ArrowUp" as const },
	ArrowDown: { action: 0 as const, pressedKey: "ArrowDown" as const },
} as const;

export default function SortingStage({
	data,
	draft,
	setCurrentStage,
	rankingType = "artist",
	albumId,
}: SortingStageProps) {
	const excluded = useAppSelector((state) => state.sorter.excluded);
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);
	//const isError = useAppSelector((state) => state.sorter.isError);
	const dispatch = useAppDispatch();

	const { showAlert, closeTop } = useModal();

	const [selectedButton, setSelectedButton] = useState<string | null>(null);

	const tracks = excluded
		? data.filter(
				(track) => {
					// 基本過濾：不在 excluded 清單中
					const notExcluded = !excluded.albums.includes(track.albumId as string) &&
						!excluded.tracks.includes(track.id);

					// 專輯排名模式：額外排除沒有 albumId 的單曲
					if (rankingType === "album") {
						return notExcluded && track.albumId;
					}

					return notExcluded;
				}
			)
		: data.filter(track => {
				// 沒有 excluded 但在專輯排名模式時，仍需排除單曲
				if (rankingType === "album") {
					return track.albumId;
				}
				return true;
			});
	const artistId = tracks[0].artistId;
	const router = useRouter();

	const {
		leftField,
		rightField,
		finishFlag,
		sortList,
		handleSave,
		restorePreviousState,
	} = useSorter({ tracks, draft, setCurrentStage, rankingType, albumId });

	//清除排名紀錄並重新開始
	function handleClear() {
		deleteRankingDraft(
			artistId,
			rankingType === "album" ? "ALBUM" : "ARTIST",
			albumId
		);
		dispatch(setPercentage(0));
		dispatch(setSaveStatus("idle"));
		setCurrentStage("filter");
	}

	//離開排名介面
	function handleQuit() {
		dispatch(setSaveStatus("idle"));
		router.replace(`/artist/${artistId}/overview`);
	}

	//用鍵盤選擇歌曲
	const [pressedKey, setPressedKey] = useState<PressedKeyType | null>(null);

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
		<section className="container select-none space-y-6">
			{(excluded || draft) && (
				<>
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
							<Button variant="outline" onClick={() => showAlert({
								title: "Are You Sure?",
											description: "You will clear your sorting record.",
											confirmText: "Clear and Restart",
											onConfirm: () => handleClear(),
											onCancel: () => closeTop(),
							})}>
								Restart
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									if (saveStatus === "idle")
										showAlert({
											title: "Are You Sure?",
											description: "Your sorting record has not been saved.",
											confirmText: "Quit",
											cancelText: "Save",
											onConfirm: () => handleQuit(),
											onCancel: () => {
												async () => {
													await handleSave();
													handleQuit();
												};
											},
										});
									else handleQuit();
								}}
							>
								Quit
							</Button>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
