"use client";

import React, {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";

type SorterContextType = {
	excluded: FilterType | null;
	setExcluded: Dispatch<SetStateAction<FilterType | null>>;
	percentage: number;
	setPercentage: Dispatch<SetStateAction<number>>;
};

export type FilterType = { albums: string[]; tracks: string[] };

const SorterContext = createContext<SorterContextType | null>(null);

export function SorterContextProvider({ children }: { children: ReactNode }) {
	const [excluded, setExcluded] = useState<FilterType | null>(null);
	const [percentage, setPercentage] = useState<number>(0);

	return (
		<SorterContext.Provider
			value={{ excluded, setExcluded, percentage, setPercentage }}
		>
			{children}
		</SorterContext.Provider>
	);
}

export default function useSorterContext() {
	const context = useContext(SorterContext);
	if (!context)
		throw new Error(
			"useSorterContext must be use within a SorterContextProvider"
		);

	return context;
}
