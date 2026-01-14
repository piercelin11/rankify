"use client";

import React, {
	createContext,
	useContext,
	useState,
	useMemo,
	ReactNode,
} from "react";

export type SaveStatusType = "idle" | "pending" | "saved" | "failed";

// 拆分成兩個 Context：按「變動頻率」分離
const SorterStateContext = createContext<{
	saveStatus: SaveStatusType;
	percentage: number;
} | undefined>(undefined);

const SorterActionsContext = createContext<{
	setSaveStatus: (status: SaveStatusType) => void;
	setPercentage: (percentage: number) => void;
} | undefined>(undefined);

export function SorterProvider({ children }: { children: ReactNode }) {
	const [saveStatus, setSaveStatus] = useState<SaveStatusType>("idle");
	const [percentage, setPercentage] = useState<number>(0);

	// Actions 永不改變（React 保證 useState 的 setter 穩定）
	// 不需要 useMemo，直接賦值即可
	const actions = { setSaveStatus, setPercentage };

	// State 只在值變化時才改變
	const state = useMemo(
		() => ({
			saveStatus,
			percentage,
		}),
		[saveStatus, percentage]
	);

	return (
		<SorterActionsContext.Provider value={actions}>
			<SorterStateContext.Provider value={state}>
				{children}
			</SorterStateContext.Provider>
		</SorterActionsContext.Provider>
	);
}

// 提供兩個獨立的 Hook
export function useSorterState() {
	const context = useContext(SorterStateContext);
	if (context === undefined) {
		throw new Error("useSorterState must be used within a SorterProvider");
	}
	return context;
}

export function useSorterActions() {
	const context = useContext(SorterActionsContext);
	if (context === undefined) {
		throw new Error("useSorterActions must be used within a SorterProvider");
	}
	return context;
}

// 保留舊 Hook 作為向後相容
export function useSorterContext() {
	return { ...useSorterState(), ...useSorterActions() };
}
