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
	isSaved: boolean;
	setSaved: Dispatch<SetStateAction<boolean>>;
	isSaving: boolean;
	setSaving: Dispatch<SetStateAction<boolean>>;
};

export type FilterType = { albums: string[]; tracks: string[] };

const SorterContext = createContext<SorterContextType | null>(null);

export function SorterContextProvider({ children }: { children: ReactNode }) {
	const [excluded, setExcluded] = useState<FilterType | null>(null);
	const [percentage, setPercentage] = useState<number>(0);
	const [isSaving, setSaving] = useState<boolean>(false);
	const [isSaved, setSaved] = useState<boolean>(false);

	return (
		<SorterContext.Provider
			value={{
				excluded,
				setExcluded,
				percentage,
				setPercentage,
				isSaving,
				setSaving,
				isSaved,
				setSaved,
			}}
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
