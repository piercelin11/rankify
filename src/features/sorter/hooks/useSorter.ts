import { useSorterActions } from "@/contexts/SorterContext";
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
import { useAutoSave } from "./useAutoSave";
import { processSortChoice } from "../utils/sorterAlgorithm";
import { StorageStrategy } from "../storage/StorageStrategy";

type SortChoice = -1 | 0 | 1;

type UseSorterStateProps = {
	initialState: SorterStateType;
	tracks: TrackData[];
	storage: StorageStrategy;
};

type UseSorterStateReturn = {
	leftField: TrackData | undefined;
	rightField: TrackData | undefined;
	finishFlag: { current: number };
	isRankingComplete: boolean;
	handleSave: () => Promise<{ type: string; message: string }>;
	restorePreviousState: () => void;
	sortList: (flag: number) => void;
};

export default function useSorter({
	initialState,
	tracks,
	storage,
}: UseSorterStateProps): UseSorterStateReturn {
	const { setSaveStatus, setPercentage } = useSorterActions();

	// 初始化 saveStatus
	useEffect(() => {
		setPercentage(initialState.percent);
		setSaveStatus(storage.getInitialSaveStatus());
	}, [initialState.percent, setPercentage, setSaveStatus, storage]);

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
		enabled: storage.capabilities.canAutoSave,
		onSave: (state) => storage.save(state),
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
			await storage.save(state);
			setSaveStatus("saved");
			return { type: "success", message: "Draft saved successfully" };
		} catch {
			setSaveStatus("failed");
			return { type: "error", message: "Failed to save draft" };
		}
	}, [state, storage, setSaveStatus]);

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

				// 如果完成，處理完成邏輯
				if (newState.finishFlag === 1) {
					// 統一呼叫 storage.finalize
					storage.finalize(newState, tracks);
				} else {
					// 未完成：觸發自動儲存 (內部已判斷 enabled)
					triggerAutoSave(newState);
				}
			} catch (err) {
				console.error(err);
			}
		},
		[triggerAutoSave, setSaveStatus, setPercentage, storage, tracks]
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
		finishFlag: { current: state?.finishFlag || 0 }, // 保持原本的 ref 介面 (後向相容)
		isRankingComplete: state?.finishFlag === 1, // 新增語義化的 boolean 值
		handleSave,
		restorePreviousState,
		sortList,
	};
}
