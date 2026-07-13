import { useState } from "react";

export function useWeightedItems<T>(weightedItems: T[], unweightedItems: T[]) {
	const [weighted, setWeighted] = useState(true);

	return {
		weighted,
		setWeighted,
		items: weighted ? weightedItems : unweightedItems,
	};
}
