/**
 * Competition ranking (1 2 2 4): items with equal value share the same rank,
 * and the next distinct value's rank skips ahead to its 1-based index.
 * `sorted` must already be sorted descending by `getValue`.
 */
export function getCompetitionRanks<T>(
	sorted: T[],
	getValue: (item: T) => number
): number[] {
	const ranks: number[] = [];
	let currentRank = 1;

	sorted.forEach((item, index) => {
		if (index > 0 && getValue(item) !== getValue(sorted[index - 1])) {
			currentRank = index + 1;
		}
		ranks.push(currentRank);
	});

	return ranks;
}
