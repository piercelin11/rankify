"use client";
import React, {
	useState,
	useEffect,
	useRef,
	startTransition,
	useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { RankingDraftData, TrackData } from "@/types/data";
import { cn } from "@/lib/cn";
import saveDraft from "@/lib/action/user/saveDraft";
import deleteRankingDraft from "@/lib/action/user/deleteRankingDraft";
import saveDraftResult from "@/lib/action/user/saveDraftResult";
import ComfirmationModal from "../general/ComfirmationModal";
import { debounce } from "chart.js/helpers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPercentage, setSaveStatus } from "@/features/sorter/sorterSlice";

type HistoryState = {
	cmp1: number;
	cmp2: number;
	head1: number;
	head2: number;
	rec: number[];
	nrec: number;
	equal: number[];
	finishSize: number;
	finishFlag: number;
	lstMember: number[][];
	parent: number[];
	totalSize: number;
	percent: number;
};

export type RankingResultData = TrackData & {
	ranking: number;
};

type SorterFieldProps = {
	data: TrackData[];
	draft: RankingDraftData | null;
};

const autoSaveCounter = 15;

export default function SorterField({ data, draft }: SorterFieldProps) {
	const excluded = useAppSelector((state) => state.sorter.excluded);
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);
	const dispatch = useAppDispatch();

	const [quitIsOpen, setQuitOpen] = useState<boolean>(false);

	const tracks = excluded
		? data.filter(
				(data) =>
					!excluded.albums.includes(data.albumId as string) &&
					!excluded.tracks.includes(data.id)
			)
		: data;
	const artistId = tracks[0]?.artistId;
	const router = useRouter();

	const namMember = useRef<string[]>(tracks.map((item) => item.name));

	const [leftField, setLeftField] = useState<TrackData | undefined>();
	const [rightField, setRightField] = useState<TrackData | undefined>();

	const history = useRef<HistoryState[]>([]);
	const lstMember = useRef<number[][]>([]);
	const parent = useRef<number[]>([]);
	const equal = useRef<number[]>([]);
	const rec = useRef<number[]>([]);
	const array = useRef<string[]>([]);

	const cmp1 = useRef(0);
	const cmp2 = useRef(0);
	const head1 = useRef(0);
	const head2 = useRef(0);
	const nrec = useRef(0);
	const totalSize = useRef(0);
	const finishSize = useRef(0);
	const finishFlag = useRef(0);
	const percent = useRef(0);

	//將歌曲分割成小單位
	function initList() {
		var n = 0;
		var mid;
		var i;

		lstMember.current[n] = [];
		for (i = 0; i < namMember.current.length; i++) {
			lstMember.current[n][i] = i;
		}
		parent.current[n] = -1;
		totalSize.current = 0;
		n++;

		for (i = 0; i < lstMember.current.length; i++) {
			if (lstMember.current[i].length >= 2) {
				mid = Math.ceil(lstMember.current[i].length / 2);
				lstMember.current[n] = lstMember.current[i].slice(0, mid);
				totalSize.current += lstMember.current[n].length;
				parent.current[n] = i;
				n++;
				lstMember.current[n] = lstMember.current[i].slice(
					mid,
					lstMember.current[i].length
				);
				totalSize.current += lstMember.current[n].length;
				parent.current[n] = i;
				n++;
			}
		}

		for (i = 0; i < namMember.current.length; i++) {
			rec.current[i] = 0;
		}
		nrec.current = 0;

		for (i = 0; i <= namMember.current.length; i++) {
			equal.current[i] = -1;
		}

		cmp1.current = lstMember.current.length - 2;
		cmp2.current = lstMember.current.length - 1;
		head1.current = 0;
		head2.current = 0;
		finishSize.current = 0;
		finishFlag.current = 0;
	}

	//用來對歌曲列表進行排序的根據 flag 的值，可以決定選擇左邊的歌曲、右邊的歌曲，或者宣告平局。
	function sortList(flag: number) {
		recordHistory();

		var i;
		if (flag === -1) {
			rec.current[nrec.current] =
				lstMember.current[cmp1.current][head1.current];
			head1.current++;
			nrec.current++;
			finishSize.current++;
			while (equal.current[rec.current[nrec.current - 1]] != -1) {
				rec.current[nrec.current] =
					lstMember.current[cmp1.current][head1.current];
				head1.current++;
				nrec.current++;
				finishSize.current++;
			}
		} else if (flag === 1) {
			rec.current[nrec.current] =
				lstMember.current[cmp2.current][head2.current];
			head2.current++;
			nrec.current++;
			finishSize.current++;
			while (equal.current[rec.current[nrec.current - 1]] != -1) {
				rec.current[nrec.current] =
					lstMember.current[cmp2.current][head2.current];
				head2.current++;
				nrec.current++;
				finishSize.current++;
			}
		} else {
			rec.current[nrec.current] =
				lstMember.current[cmp1.current][head1.current];
			head1.current++;
			nrec.current++;
			finishSize.current++;
			while (equal.current[rec.current[nrec.current - 1]] != -1) {
				rec.current[nrec.current] =
					lstMember.current[cmp1.current][head1.current];
				head1.current++;
				nrec.current++;
				finishSize.current++;
			}
			equal.current[rec.current[nrec.current - 1]] =
				lstMember.current[cmp2.current][head2.current];
			rec.current[nrec.current] =
				lstMember.current[cmp2.current][head2.current];
			head2.current++;
			nrec.current++;
			finishSize.current++;
			while (equal.current[rec.current[nrec.current - 1]] != -1) {
				rec.current[nrec.current] =
					lstMember.current[cmp2.current][head2.current];
				head2.current++;
				nrec.current++;
				finishSize.current++;
			}
		}

		if (
			head1.current < lstMember.current[cmp1.current].length &&
			head2.current == lstMember.current[cmp2.current].length
		) {
			while (head1.current < lstMember.current[cmp1.current].length) {
				rec.current[nrec.current] =
					lstMember.current[cmp1.current][head1.current];
				head1.current++;
				nrec.current++;
				finishSize.current++;
			}
		} else if (
			head1.current == lstMember.current[cmp1.current].length &&
			head2.current < lstMember.current[cmp2.current].length
		) {
			while (head2.current < lstMember.current[cmp2.current].length) {
				rec.current[nrec.current] =
					lstMember.current[cmp2.current][head2.current];
				head2.current++;
				nrec.current++;
				finishSize.current++;
			}
		}

		if (
			head1.current == lstMember.current[cmp1.current].length &&
			head2.current == lstMember.current[cmp2.current].length
		) {
			for (
				i = 0;
				i <
				lstMember.current[cmp1.current].length +
					lstMember.current[cmp2.current].length;
				i++
			) {
				lstMember.current[parent.current[cmp1.current]][i] = rec.current[i];
			}
			lstMember.current.pop();
			lstMember.current.pop();
			cmp1.current = cmp1.current - 2;
			cmp2.current = cmp2.current - 2;
			head1.current = 0;
			head2.current = 0;

			if (head1.current == 0 && head2.current == 0) {
				for (i = 0; i < namMember.current.length; i++) {
					rec.current[i] = 0;
				}
				nrec.current = 0;
			}
		}

		if (cmp1.current < 0) {
			const percentage = Math.floor(
				(finishSize.current * 100) / totalSize.current
			);
			percent.current = percentage;
			dispatch(setPercentage(percentage));
			showResult();
			finishFlag.current = 1;
		} else {
			showImage();
		}

		handleAutoSave();
	}

	//將歌名顯示於比較兩首歌曲的表格中
	function showImage() {
		const percentage = Math.floor(
			(finishSize.current * 100) / totalSize.current
		);
		const leftField =
			"" + toNameFace(lstMember.current[cmp1.current][head1.current]);
		const rightField =
			"" + toNameFace(lstMember.current[cmp2.current][head2.current]);

		const leftFieldData = tracks.find((item) => item.name === leftField);
		const rightFieldData = tracks.find((item) => item.name === rightField);
		setLeftField(leftFieldData);
		setRightField(rightFieldData);

		percent.current = percentage;
		dispatch(setPercentage(percentage));
	}

	//將排序數字轉換成歌名
	function toNameFace(n: number) {
		var str = namMember.current[n];
		return str;
	}

	//紀錄當前變數與陣列資料，用於 sortList 中
	function recordHistory() {
		var prevState = {
			cmp1: cmp1.current,
			cmp2: cmp2.current,
			head1: head1.current,
			head2: head2.current,
			rec: rec.current.slice(),
			nrec: nrec.current,
			equal: equal.current.slice(),
			finishSize: finishSize.current,
			finishFlag: finishFlag.current,
			lstMember: lstMember.current.slice(),
			parent: parent.current.slice(),
			totalSize: totalSize.current,
			percent: percent.current,
		};
		history.current.push(prevState);
	}

	//儲存記錄到本地存儲
	async function handleSave() {
		var currentState = {
			cmp1: cmp1.current,
			cmp2: cmp2.current,
			head1: head1.current,
			head2: head2.current,
			rec: rec.current.slice(),
			nrec: nrec.current,
			equal: equal.current.slice(),
			finishSize: finishSize.current,
			finishFlag: finishFlag.current,
			lstMember: lstMember.current.slice(),
			parent: parent.current.slice(),
			totalSize: totalSize.current,
			namMember: namMember.current,
			percent: percent.current,
		};
		await saveDraft(artistId, JSON.stringify(currentState));
	}

	//放棄或退出排名遊戲並回到歌手頁面
	function handleQuit() {
		router.replace(`/artist/${artistId}/overview`);
	}

	//將所有變數與陣列資料重回上一步驟的資料
	function restorePreviousState() {
		var prevState = history.current.pop();

		if (!prevState) {
			alert("No previous step available.");
		} else {
			cmp1.current = prevState.cmp1;
			cmp2.current = prevState.cmp2;
			head1.current = prevState.head1;
			head2.current = prevState.head2;
			rec.current = prevState.rec;
			nrec.current = prevState.nrec;
			equal.current = prevState.equal;
			finishSize.current = prevState.finishSize;
			finishFlag.current = prevState.finishFlag;
			lstMember.current = prevState.lstMember.slice();
			parent.current = prevState.parent.slice();
			totalSize.current = prevState.totalSize;
			percent.current = prevState.percent;
			showImage();
			dispatch(setPercentage(prevState.percent));
		}
	}

	//刪除草稿資料
	function handleClear() {
		deleteRankingDraft(artistId);
		dispatch(setPercentage(0));
		router.replace(`/sorter/${artistId}/filter`);
	}

	//顯示最終排序結果
	async function showResult() {
		var rankingNum = 1;
		var sameRank = 1;
		var i: number;
		let resultArray: RankingResultData[] | null = [];

		for (i = 0; i < namMember.current.length; i++) {
			const foundTrack = tracks.find(
				(item) => item.name === namMember.current[lstMember.current[0][i]]
			)!;

			resultArray.push({
				ranking: rankingNum,
				...foundTrack,
			});

			if (i < namMember.current.length - 1) {
				if (
					equal.current[lstMember.current[0][i]] == lstMember.current[0][i + 1]
				) {
					sameRank++;
				} else {
					rankingNum += sameRank;
					sameRank = 1;
				}
			}
		}

		for (i = 0; i < namMember.current.length; i++) {
			array.current[i] = namMember.current[lstMember.current[0][i]];
		}

		var currentState = {
			cmp1: cmp1.current,
			cmp2: cmp2.current,
			head1: head1.current,
			head2: head2.current,
			rec: rec.current.slice(),
			nrec: nrec.current,
			equal: equal.current.slice(),
			finishSize: finishSize.current,
			finishFlag: finishFlag.current,
			lstMember: lstMember.current.slice(),
			parent: parent.current.slice(),
			totalSize: totalSize.current,
			namMember: namMember.current,
			percent: percent.current,
		};

		await saveDraftResult(artistId, resultArray, JSON.stringify(currentState));
		router.replace(`/sorter/${artistId}/result`);
	}

	//處理自動儲存的部分
	const autoSave = useRef(
		debounce(() => {
			startTransition(async () => {
				dispatch(setSaveStatus("pending"));
				try {
					await handleSave();
					dispatch(setSaveStatus("saved"));
				} catch (error) {
					console.error("Failed to save draft:", error);
				}
			});
		}, 1000 * autoSaveCounter)
	).current;

	function handleAutoSave() {
		if (saveStatus === "saved") dispatch(setSaveStatus("idle"));
		autoSave();
	}

	useEffect(() => {
		if (draft?.result) {
			router.replace(`/sorter/${artistId}/result`);
		} else if (draft?.draft) {
			const history = JSON.parse(draft.draft);
			cmp1.current = history.cmp1;
			cmp2.current = history.cmp2;
			head1.current = history.head1;
			head2.current = history.head2;
			rec.current = history.rec;
			nrec.current = history.nrec;
			equal.current = history.equal;
			finishSize.current = history.finishSize;
			finishFlag.current = history.finishFlag;
			lstMember.current = history.lstMember;
			parent.current = history.parent;
			totalSize.current = history.totalSize;
			namMember.current = history.namMember;
			showImage();
		} else if (!excluded) {
			router.replace(`/sorter/${artistId}/filter`);
		} else {
			initList();
			showImage();
		}
	}, [draft]);

	//用鍵盤選擇歌曲
	const [pressedBtn, setPressedBtn] = useState<string>("");

	function handleKeyDown(e: KeyboardEvent): void {
		const key = e.key;
		if (key === "ArrowLeft") {
			setPressedBtn("ArrowLeft");
		}
		if (key === "ArrowRight") {
			setPressedBtn("ArrowRight");
		}
		if (key === "ArrowUp") {
			setPressedBtn("ArrowUp");
		}
		if (key === "ArrowDown") {
			setPressedBtn("ArrowDown");
		}
	}

	const handleKeyUp = useCallback(
		(e: KeyboardEvent): void => {
			const key = e.key;
			if (key === "ArrowLeft") {
				if (finishFlag.current === 0) sortList(-1);
				setPressedBtn("");
			}
			if (key === "ArrowRight") {
				if (finishFlag.current === 0) sortList(1);
				setPressedBtn("");
			}
			if (key === "ArrowUp" || key === "ArrowDown") {
				if (finishFlag.current === 0) sortList(0);
				setPressedBtn("");
			}
		},
		[data]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		console.log("keyup");

		return function cleanup() {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [handleKeyUp]);

	return (
		<div className="max-w-[1280px] select-none space-y-6 2xl:max-w-[1680px]">
			{(excluded || draft) && (
				<>
					<div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-6">
						<div
							className={cn(
								"col-span-1 row-span-2 flex cursor-pointer flex-col items-center justify-center rounded-xl bg-zinc-900 p-5 hover:bg-zinc-800",
								{
									"bg-zinc-750": pressedBtn === "ArrowLeft",
								}
							)}
							onClick={() => {
								if (finishFlag.current === 0) sortList(-1);
							}}
							onKeyDown={(e) => {
								console.log(e.key);
							}}
						>
							<iframe
								className="mb-5"
								src={`https://open.spotify.com/embed/track/${leftField?.id}`}
								width="100%"
								height="80"
								allow="autoplay; encrypted-media"
							></iframe>
							<img
								className="rounded-lg"
								src={leftField?.img || "/pic/placeholder.jpg"}
								alt="cover"
							/>
							<div className="space-y-1 pb-3 pt-8 text-center">
								<p className="line-clamp-1 text-lg font-semibold">
									{leftField?.name}
								</p>
								<p className="line-clamp-1 text-zinc-500">
									{leftField?.album?.name || "Non-album track"}
								</p>
							</div>
						</div>
						<div
							className={cn(
								"col-span-1 row-span-1 flex cursor-pointer flex-col items-center justify-center rounded-xl bg-zinc-900 p-5 hover:bg-zinc-800",
								{
									"bg-zinc-750": pressedBtn === "ArrowUp",
								}
							)}
							onClick={() => {
								if (finishFlag.current === 0) sortList(0);
							}}
						>
							i like both
						</div>
						<div
							className={cn(
								"col-span-1 row-span-1 flex cursor-pointer flex-col items-center justify-center rounded-xl bg-zinc-900 p-5 hover:bg-zinc-800",
								{
									"bg-zinc-750": pressedBtn === "ArrowDown",
								}
							)}
							onClick={() => {
								if (finishFlag.current === 0) sortList(0);
							}}
						>
							no opinion
						</div>
						<div
							className={cn(
								"col-span-1 row-span-2 flex cursor-pointer flex-col items-center justify-center rounded-xl bg-zinc-900 p-5 hover:bg-zinc-800",
								{
									"bg-zinc-750": pressedBtn === "ArrowRight",
								}
							)}
							onClick={() => {
								if (finishFlag.current === 0) sortList(1);
							}}
						>
							<iframe
								className="mb-5"
								src={`https://open.spotify.com/embed/track/${rightField?.id}`}
								width="100%"
								height="80"
								allow="autoplay; encrypted-media"
							></iframe>
							<img
								className="rounded-lg"
								src={rightField?.img || "/pic/placeholder.jpg"}
								alt="cover"
							/>
							<div className="space-y-1 pb-3 pt-8 text-center">
								<p className="line-clamp-1 text-lg font-semibold">
									{rightField?.name}
								</p>
								<p className="line-clamp-1 text-zinc-500">
									{rightField?.album?.name || "Non-album track"}
								</p>
							</div>
						</div>
					</div>

					<div className="flex justify-between">
						<div
							className="flex cursor-pointer items-center gap-5 rounded-lg bg-zinc-900 p-5 hover:bg-zinc-800"
							onClick={restorePreviousState}
						>
							<ChevronLeftIcon />
							<p>Previous Step</p>
						</div>

						<div className="flex gap-4">
							<div
								className="flex cursor-pointer items-center gap-5 rounded-lg bg-zinc-900 p-5 hover:bg-zinc-800"
								onClick={handleClear}
							>
								<p>Clear and Restart</p>
							</div>
							{saveStatus === "idle" && history.current.length !== 0 ? (
								<ComfirmationModal
									onConfirm={async () => {
										await handleSave();
										handleQuit();
									}}
									onCancel={() => handleQuit()}
									isOpen={quitIsOpen}
									setOpen={setQuitOpen}
									cancelLabel="Quit"
									comfirmLabel="Save"
									description="Your ranking record has not been saved."
									warning="Are you sure you want to leave?"
								>
									<div
										className="flex cursor-pointer items-center gap-5 rounded-lg bg-zinc-900 p-5 hover:bg-zinc-800"
										onClick={() => setQuitOpen(true)}
									>
										<p>Quit</p>
									</div>
								</ComfirmationModal>
							) : (
								<div
									className="flex cursor-pointer items-center gap-5 rounded-lg bg-zinc-900 p-5 hover:bg-zinc-800"
									onClick={() => handleQuit()}
								>
									<p>Quit</p>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
