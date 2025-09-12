"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { RankingDraftData, TrackData } from "@/types/data";
import deleteRankingDraft from "../../ranking/actions/deleteRankingDraft";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	setError,
	setPercentage,
	setSaveStatus,
} from "@/features/sorter/slices/sorterSlice";
import Button from "@/components/buttons/Button";
import { CurrentStage } from "./SorterPage";
import useSorter from "@/features/sorter/hooks/useSorter";
import ModalWrapper from "@/components/modals/ModalWrapper";
import TrackBtn from "./TrackBtn";
import EqualBtn from "./EqualBtn";

export type RankingResultData = TrackData & {
	ranking: number;
};

type SortingStageProps = {
	data: TrackData[];
	draft: RankingDraftData | null;
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
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
}: SortingStageProps) {
	const excluded = useAppSelector((state) => state.sorter.excluded);
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);
	const isError = useAppSelector((state) => state.sorter.isError);
	const dispatch = useAppDispatch();

	const [isQuitOpen, setQuitOpen] = useState<boolean>(false);
	const [isRestartOpen, setRestartOpen] = useState<boolean>(false);
	const [selectedButton, setSelectedButton] = useState<string | null>(null);

	const tracks = excluded
		? data.filter(
				(data) =>
					!excluded.albums.includes(data.albumId as string) &&
					!excluded.tracks.includes(data.id)
			)
		: data;
	const artistId = tracks[0].artistId;
	const router = useRouter();

	const {
		leftField,
		rightField,
		finishFlag,
		sortList,
		handleSave,
		restorePreviousState,
	} = useSorter({ tracks, draft, setCurrentStage });

	//清除排名紀錄並重新開始
	function handleClear() {
		deleteRankingDraft(artistId);
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
	const handleSelectFeedback = useCallback((buttonId: string, action: number) => {
		setSelectedButton(buttonId);
		setTimeout(() => setSelectedButton(null), 200);
		if (finishFlag.current === 0) sortList(action);
	}, [finishFlag, sortList]);

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
			<ModalWrapper className="w-max" isRequestOpen={isError}>
				<div className="flex flex-col items-center space-y-8 p-10">
					<div className="space-y-2">
						<h2 className="text-center">Oops!</h2>
						<p className="text-description text-center">
							Something went wrong! Please try again!
						</p>
						<p className="text-center font-semibold">
							Warning: this may delete your draft.
						</p>
					</div>
					<Button
						variant="primary"
						onClick={async () => {
							await deleteRankingDraft(artistId);
							setCurrentStage("filter");
							dispatch(setError(false));
						}}
					>
						try again
					</Button>
				</div>
			</ModalWrapper>
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
						<Button variant="neutral" onClick={restorePreviousState}>
							<ChevronLeftIcon />
							<p>Previous</p>
						</Button>

						<div className="flex gap-3 xl:gap-6">
							<Button variant="neutral" onClick={() => setRestartOpen(true)}>
								Restart
							</Button>
							<Button
								variant="neutral"
								onClick={() => {
									if (saveStatus === "idle") setQuitOpen(true);
									else handleQuit();
								}}
							>
								Quit
							</Button>

							<ComfirmationModal
								onConfirm={async () => {
									await handleSave();
									handleQuit();
								}}
								onCancel={() => handleQuit()}
								isOpen={isQuitOpen}
								setOpen={setQuitOpen}
								cancelLabel="Quit"
								comfirmLabel="Save"
								description="Your sorting record has not been saved."
								warning="Are you sure you want to leave?"
							/>
							<ComfirmationModal
								onConfirm={handleClear}
								onCancel={() => setRestartOpen(false)}
								isOpen={isRestartOpen}
								setOpen={setRestartOpen}
								cancelLabel="Cancel"
								comfirmLabel="Clear and Restart"
								description="You will clear your sorting record."
								warning="Are you sure you want to clear and restart?"
							/>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
