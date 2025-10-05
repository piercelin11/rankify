"use client";

import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
} from "react";

export type SaveStatusType = "idle" | "pending" | "saved" | "failed";

type SorterContextValue = {
	saveStatus: SaveStatusType;
	percentage: number;
	setSaveStatus: (status: SaveStatusType) => void;
	setPercentage: (percentage: number) => void;
};

const SorterContext = createContext<SorterContextValue | undefined>(undefined);

export function SorterProvider({ children }: { children: ReactNode }) {
	const [saveStatus, setSaveStatus] = useState<SaveStatusType>("idle");
	const [percentage, setPercentage] = useState<number>(0);

	const value = {
		saveStatus,
		percentage,
		setSaveStatus,
		setPercentage,
	};

	return (
		<SorterContext.Provider value={value}>{children}</SorterContext.Provider>
	);
}

export function useSorterContext() {
	const context = useContext(SorterContext);
	if (context === undefined) {
		throw new Error("useSorter must be used within a SorterProvider");
	}
	return context;
}
