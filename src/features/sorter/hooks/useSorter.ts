import { useSorterContext } from "@/contexts/SorterContext";
import { TrackData } from "@/types/data";
import {
	useEffect,
	useCallback,
	useState,
	useMemo,
	useRef,
} from "react";
import {
	SorterStateSnapshotType,
	SorterStateType,
} from "@/lib/schemas/sorter";
import finalizeDraft from "../actions/finalizeDraft";
import saveDraft from "../actions/saveDraft";
import { useAutoSave } from "./useAutoSave";

type SortChoice = -1 | 0 | 1;

type UseSorterStateProps = {
	initialState: SorterStateType;
	tracks: TrackData[];
	submissionId: string;
	userId: string;
};

type UseSorterStateReturn = {
	leftField: TrackData | undefined;
	rightField: TrackData | undefined;
	finishFlag: { current: number };
	handleSave: () => Promise<{ type: string; message: string }>;
	restorePreviousState: () => void;
	sortList: (flag: number) => void;
};

// 核心排序邏輯 (對應原本的 sortList)
function processSortChoice(
	state: SorterStateType,
	flag: SortChoice
): SorterStateType {
	// 深拷貝需要修改的部分
	const newState: SorterStateType = {
		...state,
		lstMember: state.lstMember.map((arr) => [...arr]),
		parent: [...state.parent],
		equal: [...state.equal],
		rec: [...state.rec],
		namMember: [...state.namMember],
		history: [...state.history], 
	};

	// 原本 sortList 的邏輯，完全相同
	if (flag === -1) {
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp1][newState.head1];
		newState.head1++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else if (flag === 1) {
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp2][newState.head2];
		newState.head2++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else {
		// flag === 0 (平手)
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp1][newState.head1];
		newState.head1++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
		newState.equal[newState.rec[newState.nrec - 1]] =
			newState.lstMember[newState.cmp2][newState.head2];
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp2][newState.head2];
		newState.head2++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp2][newState.head2];
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
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else if (
		newState.head1 === newState.lstMember[newState.cmp1].length &&
		newState.head2 < newState.lstMember[newState.cmp2].length
	) {
		while (newState.head2 < newState.lstMember[newState.cmp2].length) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp2][newState.head2];
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
		const totalLength =
			newState.lstMember[newState.cmp1].length +
			newState.lstMember[newState.cmp2].length;
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
	} else {
		newState.percent = Math.floor(
			(newState.finishSize * 100) / newState.totalSize
		);

		// 更安全的索引取得方式
		const leftGroup = newState.lstMember[newState.cmp1];
		const rightGroup = newState.lstMember[newState.cmp2];

		newState.currentLeftIndex =
			leftGroup && newState.head1 < leftGroup.length
				? leftGroup[newState.head1]
				: null;

		newState.currentRightIndex =
			rightGroup && newState.head2 < rightGroup.length
				? rightGroup[newState.head2]
				: null;
	}

	return newState;
}

// 主要的 hook
export default function useSorter({
	initialState,
	tracks,
	submissionId,
	userId: _userId
}: UseSorterStateProps): UseSorterStateReturn {
	const { setSaveStatus, setPercentage } = useSorterContext();

	// 初始化 saveStatus: 頁面載入時永遠是已儲存狀態（草稿來自資料庫）
	useEffect(() => {
		setPercentage(initialState.percent);
		setSaveStatus("saved");
	}, [initialState.percent, setPercentage, setSaveStatus]);

	// 用 useState 管理狀態
	const [state, setState] = useState<SorterStateType>(initialState);

	// 當前比較的歌曲 (使用 state.tracks 而非外部 tracks)
	const leftField = useMemo(() => {
		if (
			!state ||
			typeof state.currentLeftIndex !== "number" ||
			state.currentLeftIndex < 0
		)
			return undefined;
		if (state.currentLeftIndex >= state.namMember.length) return undefined;

		const trackName = state.namMember[state.currentLeftIndex];
		if (!trackName) return undefined;

		return tracks.find((track) => track.name === trackName);
	}, [state, tracks]);

	const rightField = useMemo(() => {
		if (
			!state ||
			typeof state.currentRightIndex !== "number" ||
			state.currentRightIndex < 0
		)
			return undefined;
		if (state.currentRightIndex >= state.namMember.length) return undefined;

		const trackName = state.namMember[state.currentRightIndex];
		if (!trackName) return undefined;

		return tracks.find((track) => track.name === trackName);
	}, [state, tracks]);

	// 使用 ref 來獲取最新的值，避免閉包問題
	const stateRef = useRef(state);

	// 更新 ref
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	// 使用新的 useAutoSave Hook
	const triggerAutoSave = useAutoSave({
		submissionId,
		setSaveStatus,
		// debounceDelay 和 maxInterval 使用預設值 (10s, 2min)
	});

	// 手動儲存功能 (用於 Quit 按鈕)
	const handleSave = useCallback(async () => {
		if (!state) {
			return { type: "error", message: "No state to save" };
		}
		setSaveStatus("pending");
		try {
			const result = await saveDraft(state, submissionId);
			if (result.type === "error") {
				setSaveStatus("failed");
				return { type: "error", message: result.message };
			}
			setSaveStatus("saved");
			return { type: "success", message: "Draft saved successfully" };
		} catch {
			setSaveStatus("failed");
			return { type: "error", message: "Failed to save draft" };
		}
	}, [state, submissionId, setSaveStatus]);

	// 核心排序函數
	const sortList = useCallback(
		(flag: number) => {
			const currentState = stateRef.current;

			if (!currentState) return;

			// 記錄歷史 - 創建當前狀態的快照（不包含 history）
			const snapshot: SorterStateSnapshotType = {
				lstMember: currentState.lstMember.map((arr) => [...arr]),
				parent: [...currentState.parent],
				equal: [...currentState.equal],
				rec: [...currentState.rec],
				cmp1: currentState.cmp1,
				cmp2: currentState.cmp2,
				head1: currentState.head1,
				head2: currentState.head2,
				nrec: currentState.nrec,
				totalSize: currentState.totalSize,
				finishSize: currentState.finishSize,
				finishFlag: currentState.finishFlag,
				percent: currentState.percent,
				namMember: [...currentState.namMember],
				currentLeftIndex: currentState.currentLeftIndex,
				currentRightIndex: currentState.currentRightIndex,
			};

			// 更新狀態
			setSaveStatus("idle");

			try {
				// 執行排序邏輯 (邏輯完全相同)
				const newState = processSortChoice(currentState, flag as SortChoice);
				// 加入歷史記錄，限制長度為20
				const newHistory = [...currentState.history, snapshot];
				newState.history = newHistory.length > 20 ? newHistory.slice(-20) : newHistory;

				setState(newState);

				// 更新進度
				setPercentage(newState.percent);

				// 如果完成，跳到結果頁面
				if (newState.finishFlag === 1) {
					finalizeDraft(newState, submissionId)
				} else {
					// 觸發自動儲存 (debounce + max interval)
					triggerAutoSave(newState);
				}
			} catch (err) {
				console.error(err);
			}
		},
		[triggerAutoSave, setSaveStatus, setPercentage, submissionId]
	);

	// 復原上一步
	const restorePreviousState = useCallback(() => {
		const prevSnapshot = state.history[state.history.length - 1];

		if (!prevSnapshot) {
			alert("No previous step available.");
		} else {
			// 恢復狀態，但保留較短的歷史記錄
			const restoredState: SorterStateType = {
				...prevSnapshot,
				history: state.history.slice(0, -1),
			};
			setState(restoredState);
			setPercentage(prevSnapshot.percent);
		}
	}, [state.history, setPercentage]);

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
