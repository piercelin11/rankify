import {
	setPercentage,
	setSaveStatus,
} from "@/features/sorter/slices/sorterSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RankingDraftData, TrackData } from "@/types/data";
import React, { startTransition, useEffect, useRef, useState } from "react";
import saveDraft from "../../ranking/actions/saveDraft";
import { RankingResultData } from "../components/SortingStage";
import saveDraftResult from "../../ranking/actions/saveDraftResult";
import { debounce } from "chart.js/helpers";
import { CurrentStage } from "../components/SorterPage";

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

type UseSorterProps = {
	tracks: TrackData[];
	draft: RankingDraftData | null;
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
};

const autoSaveCounter = 15;

export default function useSorter({
	tracks,
	draft,
	setCurrentStage,
}: UseSorterProps) {
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);
	const dispatch = useAppDispatch();

	const artistId = tracks[0].artistId;

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
			percent.current = 100;
			dispatch(setPercentage(100));
			dispatch(setSaveStatus("idle"));
			showResult();
			finishFlag.current = 1;
		} else {
			showImage();
			handleAutoSave();
		}
	}

	//將歌名顯示於比較兩首歌曲的表格中
	function showImage() {
		try {
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
		} catch (error) {
			console.error("Error showing image in sorting stage:", error);
		}
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

	//顯示最終排序結果
	async function showResult() {
		var rankingNum = 1;
		var sameRank = 1;
		var i: number;
		let resultArray: RankingResultData[] | null = [];

		const trackMap = new Map(tracks.map((track) => [track.name, track]));

		for (i = 0; i < namMember.current.length; i++) {
			const foundTrack = trackMap.get(
				namMember.current[lstMember.current[0][i]]
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

		try {
			await saveDraftResult(
				artistId,
				resultArray,
				JSON.stringify(currentState)
			);
		} catch (err) {
			console.error("Error saving sorter result:", err);
		} finally {
			setCurrentStage("result");
		}
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
		if (draft?.draft) {
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
		} else {
			initList();
			showImage();
		}
	}, [draft]);

	return {
		leftField,
		rightField,
		finishFlag,
		handleSave,
		restorePreviousState,
		sortList,
	};
}
