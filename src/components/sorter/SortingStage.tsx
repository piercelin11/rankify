"use client";
import React, {
	useState,
	useEffect,
	useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { RankingDraftData, TrackData } from "@/types/data";
import { cn } from "@/lib/cn";
import deleteRankingDraft from "@/lib/action/user/deleteRankingDraft";
import ComfirmationModal from "../general/ComfirmationModal";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import {
	setPercentage
} from "@/redux/slices/sorter/sorterSlice";
import Button from "../ui/Button";
import { CurrentStage } from "./SorterPage";
import useSorter from "@/lib/hooks/useSorter";

export type RankingResultData = TrackData & {
	ranking: number;
};

type SortingStageProps = {
	data: TrackData[];
	draft: RankingDraftData | null;
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
};

type PressedKeyType = "ArrowLeft" | "ArrowRight" | "ArrowDown" | "ArrowUp";

export default function SortingStage({
	data,
	draft,
	setCurrentStage,
}: SortingStageProps) {
	const excluded = useAppSelector((state) => state.sorter.excluded);
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);
	const dispatch = useAppDispatch();

	const [isQuitOpen, setQuitOpen] = useState<boolean>(false);
	const [isRestartOpen, setRestartOpen] = useState<boolean>(false);

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
		setCurrentStage("filter");
	}

	//離開排名介面
	function handleQuit() {
		router.replace(`/artist/${artistId}/overview`);
	}

	//用鍵盤選擇歌曲
	const [pressedKey, setPressedKey] = useState<PressedKeyType | null>(null);

	function handleKeyDown(e: KeyboardEvent): void {
		const key = e.key;
		if (key === "ArrowLeft") {
			setPressedKey("ArrowLeft");
		}
		if (key === "ArrowRight") {
			setPressedKey("ArrowRight");
		}
		if (key === "ArrowUp") {
			setPressedKey("ArrowUp");
		}
		if (key === "ArrowDown") {
			setPressedKey("ArrowDown");
		}
	}

	const handleKeyUp = useCallback(
		(e: KeyboardEvent): void => {
			const key = e.key;
			if (key === "ArrowLeft") {
				if (finishFlag.current === 0) sortList(-1);
				setPressedKey(null);
			}
			if (key === "ArrowRight") {
				if (finishFlag.current === 0) sortList(1);
				setPressedKey(null);
			}
			if (key === "ArrowUp" || key === "ArrowDown") {
				if (finishFlag.current === 0) sortList(0);
				setPressedKey(null);
			}
		},
		[data]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return function cleanup() {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [handleKeyUp]);

	return (
		<section className="container select-none space-y-6">
			{(excluded || draft) && (
				<>
					<div className="grid grid-cols-2 grid-rows-[150px_75px_150px] gap-3 sm:grid-flow-col sm:grid-cols-3 sm:grid-rows-2 xl:gap-6">
						<TrackBtn
							isPressed={pressedKey === "ArrowLeft"}
							onClick={() => {
								if (finishFlag.current === 0) sortList(-1);
							}}
							data={leftField}
						/>
						<EqualBtn
							isPressed={pressedKey === "ArrowUp"}
							onClick={() => {
								if (finishFlag.current === 0) sortList(0);
							}}
						>
							i like both
						</EqualBtn>
						<EqualBtn
							isPressed={pressedKey === "ArrowDown"}
							onClick={() => {
								if (finishFlag.current === 0) sortList(0);
							}}
						>
							no opinion
						</EqualBtn>
						<TrackBtn
							isPressed={pressedKey === "ArrowRight"}
							onClick={() => {
								if (finishFlag.current === 0) sortList(1);
							}}
							data={rightField}
						/>
					</div>

					<div className="flex justify-between gap-3">
						<Button variant="darkGray" onClick={restorePreviousState}>
							<ChevronLeftIcon />
							<p>Previous</p>
						</Button>

						<div className="flex gap-3 xl:gap-6">
							<Button variant="darkGray" onClick={() => setRestartOpen(true)}>
								Restart
							</Button>
							<Button
								variant="darkGray"
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

type TrackBtnProps = {
	isPressed: boolean;
	onClick: () => void;
	data?: TrackData;
};

function TrackBtn({ isPressed, onClick, data }: TrackBtnProps) {
	return (
		<button
			className={cn(
				"col-span-2 row-span-1 flex cursor-pointer gap-2 rounded-xl bg-zinc-900 p-2 hover:bg-zinc-800 sm:col-span-1 sm:row-span-2 sm:inline lg:p-5",
				{
					"bg-zinc-750": isPressed,
				}
			)}
			onClick={onClick}
			onKeyDown={(e) => {
				console.log(e.key);
			}}
		>
			<iframe
				className="mb-5 hidden lg:block"
				src={`https://open.spotify.com/embed/track/${data?.id}`}
				width="100%"
				height="80"
				allow="autoplay; encrypted-media"
			></iframe>
			<img
				className="rounded-lg"
				src={data?.img || "/pic/placeholder.jpg"}
				alt="cover"
			/>
			<div className="m-auto flex-1 space-y-1 sm:pb-6 sm:pt-8">
				<p className="line-clamp-1 text-lg font-semibold">{data?.name}</p>
				<p className="line-clamp-1 text-zinc-500">
					{data?.album?.name || "Non-album track"}
				</p>
			</div>
		</button>
	);
}

type EqualBtnProps = {
	isPressed: boolean;
	onClick: () => void;
	children: string;
};

function EqualBtn({ isPressed, onClick, children }: EqualBtnProps) {
	return (
		<button
			className={cn(
				"col-span-1 row-span-1 flex cursor-pointer flex-col items-center justify-center rounded-xl bg-zinc-900 p-2 hover:bg-zinc-800 lg:p-5",
				{
					"bg-zinc-750": isPressed,
				}
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
