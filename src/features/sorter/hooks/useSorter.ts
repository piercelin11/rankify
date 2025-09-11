import {
	setError,
	setPercentage,
	setSaveStatus,
} from "@/features/sorter/slices/sorterSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RankingDraftData, TrackData } from "@/types/data";
import React, { startTransition, useEffect, useCallback, useState, useMemo, useRef } from "react";
import saveDraft from "../../ranking/actions/saveDraft";
import { RankingResultData } from "../components/SortingStage";
import saveDraftResult from "../../ranking/actions/saveDraftResult";
import { CurrentStage } from "../components/SorterPage";
import { debounce } from "@/lib/utils/performance.utils";

// 使用 type 慣例定義狀態
type SorterState = {
	// 核心演算法狀態 (完全對應原本的 ref)
	lstMember: number[][];
	parent: number[];
	equal: number[];
	rec: number[];
	cmp1: number;
	cmp2: number;
	head1: number;
	head2: number;
	nrec: number;
	totalSize: number;
	finishSize: number;
	finishFlag: number;
	percent: number;
	
	// 歌曲資料
	namMember: string[];
	
	// UI 狀態
	currentLeftIndex: number | null;
	currentRightIndex: number | null;
};

type SortChoice = -1 | 0 | 1;

type UseSorterProps = {
	tracks: TrackData[];
	draft: RankingDraftData | null;
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
};

type UseSorterReturn = {
	leftField: TrackData | undefined;
	rightField: TrackData | undefined;
	finishFlag: { current: number };
	handleSave: () => Promise<{ type: string; message: string; }>;
	restorePreviousState: () => void;
	sortList: (flag: number) => void;
};

const autoSaveCounter = 15;

// 初始化排序狀態 (對應原本的 initList)
function initializeSorterState(tracks: TrackData[]): SorterState {
	const namMember = tracks.map((item) => item.name);
	const lstMember: number[][] = [];
	const parent: number[] = [];
	let n = 0;
	let totalSize = 0;

	// 原本的 initList 邏輯，完全相同
	lstMember[n] = [];
	for (let i = 0; i < namMember.length; i++) {
		lstMember[n][i] = i;
	}
	parent[n] = -1;
	n++;

	for (let i = 0; i < lstMember.length; i++) {
		if (lstMember[i].length >= 2) {
			const mid = Math.ceil(lstMember[i].length / 2);
			lstMember[n] = lstMember[i].slice(0, mid);
			totalSize += lstMember[n].length;
			parent[n] = i;
			n++;
			lstMember[n] = lstMember[i].slice(mid, lstMember[i].length);
			totalSize += lstMember[n].length;
			parent[n] = i;
			n++;
		}
	}

	const rec = new Array(namMember.length).fill(0);
	const equal = new Array(namMember.length + 1).fill(-1);
	
	const cmp1 = lstMember.length - 2;
	const cmp2 = lstMember.length - 1;

	// 取得初始比較對的索引
	const leftIndex = (cmp1 >= 0 && lstMember[cmp1] && lstMember[cmp1].length > 0) ? lstMember[cmp1][0] : null;
	const rightIndex = (cmp2 >= 0 && lstMember[cmp2] && lstMember[cmp2].length > 0) ? lstMember[cmp2][0] : null;

	return {
		lstMember,
		parent,
		equal,
		rec,
		cmp1,
		cmp2,
		head1: 0,
		head2: 0,
		nrec: 0,
		totalSize,
		finishSize: 0,
		finishFlag: 0,
		percent: 0,
		namMember,
		currentLeftIndex: leftIndex,
		currentRightIndex: rightIndex,
	};
}

// 核心排序邏輯 (對應原本的 sortList)
function processSortChoice(state: SorterState, flag: SortChoice): SorterState {
	// 深拷貝需要修改的部分
	const newState: SorterState = {
		...state,
		lstMember: state.lstMember.map(arr => [...arr]),
		parent: [...state.parent],
		equal: [...state.equal],
		rec: [...state.rec],
	};

	// 原本 sortList 的邏輯，完全相同
	if (flag === -1) {
		newState.rec[newState.nrec] = newState.lstMember[newState.cmp1][newState.head1];
		newState.head1++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] = newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else if (flag === 1) {
		newState.rec[newState.nrec] = newState.lstMember[newState.cmp2][newState.head2];
		newState.head2++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] = newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else {
		// flag === 0 (平手)
		newState.rec[newState.nrec] = newState.lstMember[newState.cmp1][newState.head1];
		newState.head1++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] = newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
		newState.equal[newState.rec[newState.nrec - 1]] = newState.lstMember[newState.cmp2][newState.head2];
		newState.rec[newState.nrec] = newState.lstMember[newState.cmp2][newState.head2];
		newState.head2++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] = newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	}

	// 處理組別結束的情況
	if (
		newState.head1 < newState.lstMember[newState.cmp1].length &&
		newState.head2 === newState.lstMember[newState.cmp2].length
	) {
		while (newState.head1 < newState.lstMember[newState.cmp1].length) {
			newState.rec[newState.nrec] = newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else if (
		newState.head1 === newState.lstMember[newState.cmp1].length &&
		newState.head2 < newState.lstMember[newState.cmp2].length
	) {
		while (newState.head2 < newState.lstMember[newState.cmp2].length) {
			newState.rec[newState.nrec] = newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	}

	// 合併完成的組別
	if (
		newState.head1 === newState.lstMember[newState.cmp1].length &&
		newState.head2 === newState.lstMember[newState.cmp2].length
	) {
		const totalLength = newState.lstMember[newState.cmp1].length + newState.lstMember[newState.cmp2].length;
		for (let i = 0; i < totalLength; i++) {
			newState.lstMember[newState.parent[newState.cmp1]][i] = newState.rec[i];
		}
		newState.lstMember.pop();
		newState.lstMember.pop();
		newState.cmp1 = newState.cmp1 - 2;
		newState.cmp2 = newState.cmp2 - 2;
		newState.head1 = 0;
		newState.head2 = 0;

		if (newState.head1 === 0 && newState.head2 === 0) {
			for (let i = 0; i < newState.namMember.length; i++) {
				newState.rec[i] = 0;
			}
			newState.nrec = 0;
		}
	}

	// 檢查是否完成或更新當前比較對
	if (newState.cmp1 < 0) {
		newState.percent = 100;
		newState.finishFlag = 1;
		newState.currentLeftIndex = null;
		newState.currentRightIndex = null;
	} else {
		newState.percent = Math.floor((newState.finishSize * 100) / newState.totalSize);
		
		// 更安全的索引取得方式
		const leftGroup = newState.lstMember[newState.cmp1];
		const rightGroup = newState.lstMember[newState.cmp2];
		
		newState.currentLeftIndex = (leftGroup && newState.head1 < leftGroup.length) 
			? leftGroup[newState.head1] 
			: null;
			
		newState.currentRightIndex = (rightGroup && newState.head2 < rightGroup.length) 
			? rightGroup[newState.head2] 
			: null;
	}

	return newState;
}

// 生成最終結果 (對應原本的 showResult)
async function generateFinalResult(
	state: SorterState,
	tracks: TrackData[],
	artistId: string,
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>
): Promise<void> {
	let rankingNum = 1;
	let sameRank = 1;
	const resultArray: RankingResultData[] = [];
	
	const trackMap = new Map(tracks.map((track) => [track.name, track]));

	for (let i = 0; i < state.namMember.length; i++) {
		const foundTrack = trackMap.get(state.namMember[state.lstMember[0][i]])!;

		resultArray.push({
			ranking: rankingNum,
			...foundTrack,
		});

		if (i < state.namMember.length - 1) {
			if (state.equal[state.lstMember[0][i]] === state.lstMember[0][i + 1]) {
				sameRank++;
			} else {
				rankingNum += sameRank;
				sameRank = 1;
			}
		}
	}

	try {
		await saveDraftResult(artistId, resultArray, JSON.stringify(state));
	} catch (err) {
		console.error("Error saving sorter result:", err);
	} finally {
		setCurrentStage("result");
	}
}

// 主要的 hook
export default function useSorter({
	tracks,
	draft,
	setCurrentStage,
}: UseSorterProps): UseSorterReturn {
	const saveStatus = useAppSelector((state) => state.sorter.saveStatus);
	const dispatch = useAppDispatch();
	const artistId = tracks[0].artistId;

	// 用 useState 取代所有 useRef
	const [state, setState] = useState<SorterState | null>(null);
	const [history, setHistory] = useState<SorterState[]>([]);

	// 初始化 (對應原本的 useEffect)
	useEffect(() => {
		if (tracks.length === 0) return;
		
		if (draft?.draft) {
			// 載入存檔狀態 (與原本邏輯相同)
			try {
				const loadedState = JSON.parse(draft.draft);
				setState(loadedState);
			} catch (error) {
				console.error("Failed to load draft state:", error);
				setState(initializeSorterState(tracks));
			}
		} else {
			// 新開始 (對應原本的 initList + showImage)
			setState(initializeSorterState(tracks));
		}
	}, [draft?.draft, tracks.length]); // 使用 tracks.length 而不是整個 tracks 陣列

	// 當前比較的歌曲 (對應原本的 leftField, rightField)
	const leftField = useMemo(() => {
		if (!state || typeof state.currentLeftIndex !== 'number' || state.currentLeftIndex < 0) return undefined;
		if (state.currentLeftIndex >= state.namMember.length) return undefined;
		
		const trackName = state.namMember[state.currentLeftIndex];
		if (!trackName) return undefined;
		
		return tracks.find((track) => track.name === trackName);
	}, [state?.currentLeftIndex, state?.namMember, tracks]);

	const rightField = useMemo(() => {
		if (!state || typeof state.currentRightIndex !== 'number' || state.currentRightIndex < 0) return undefined;
		if (state.currentRightIndex >= state.namMember.length) return undefined;
		
		const trackName = state.namMember[state.currentRightIndex];
		if (!trackName) return undefined;
		
		return tracks.find((track) => track.name === trackName);
	}, [state?.currentRightIndex, state?.namMember, tracks]);

	// 儲存功能 (對應原本的 handleSave)
	const handleSave = useCallback(async () => {
		if (!state) {
			return { type: "error", message: "No state to save" };
		}
		const result = await saveDraft(artistId, JSON.stringify(state));
		return result;
	}, [state, artistId]);

	// 使用 ref 來獲取最新的值，避免閉包問題
	const stateRef = useRef(state);
	const artistIdRef = useRef(artistId);
	const dispatchRef = useRef(dispatch);
	
	// 更新 refs
	useEffect(() => {
		stateRef.current = state;
		artistIdRef.current = artistId;
		dispatchRef.current = dispatch;
	}, [state, artistId, dispatch]);

	// 創建穩定的 debounced 函數 (只創建一次)
	const debouncedAutoSave = useMemo(
		() => debounce(async () => {
			if (!stateRef.current) {
				return;
			}
			
			startTransition(async () => {
				dispatchRef.current(setSaveStatus("pending"));
				try {
					const result = await saveDraft(artistIdRef.current, JSON.stringify(stateRef.current));
					dispatchRef.current(setSaveStatus("saved"));
				} catch (error) {
					console.error("Failed to save draft:", error);
					dispatchRef.current(setSaveStatus("idle"));
				}
			});
		}, 1000 * autoSaveCounter),
		[] // 空依賴數組，只創建一次
	);


	// 核心排序函數 (完全對應原本的 sortList)
	const sortList = useCallback((flag: number) => {
		if (!state) return;
		
		// 記錄歷史 (對應原本的 recordHistory)
		setHistory(prev => [...prev, state]);
		
		// 更新狀態
		dispatch(setSaveStatus("idle"));
		
		try {
			// 執行排序邏輯 (邏輯完全相同)
			const newState = processSortChoice(state, flag as SortChoice);
			setState(newState);
			
			// 更新進度
			dispatch(setPercentage(newState.percent));
			
			// 如果完成，跳到結果頁面
			if (newState.finishFlag === 1) {
				generateFinalResult(newState, tracks, artistId, setCurrentStage);
			} else {
				// 延遲執行自動儲存，避免同步狀態更新
				setTimeout(() => {
					console.log("⏰ Triggering auto save in setTimeout, saveStatus:", saveStatus);
					if (saveStatus === "saved") dispatch(setSaveStatus("idle"));
					debouncedAutoSave();
				}, 0);
			}
		} catch (err) {
			console.error(err);
			dispatch(setError(true));
		}
	}, [state, dispatch, tracks, artistId, setCurrentStage, saveStatus, debouncedAutoSave]);

	// 復原上一步 (對應原本的 restorePreviousState)
	const restorePreviousState = useCallback(() => {
		const prevState = history[history.length - 1];
		
		if (!prevState) {
			alert("No previous step available.");
		} else {
			setState(prevState);
			setHistory(prev => prev.slice(0, -1));
			dispatch(setPercentage(prevState.percent));
		}
	}, [history, dispatch]);

	// 返回與原本完全相同的介面
	return {
		leftField,
		rightField,
		finishFlag: { current: state?.finishFlag || 0 }, // 保持原本的 ref 介面
		handleSave,
		restorePreviousState,
		sortList,
	};
}