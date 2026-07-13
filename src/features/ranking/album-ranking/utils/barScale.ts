const STEP = 50;
const CEILING = 1000;

export function calculateBarDenominator(
	items: { score: number; peak: number }[]
): number {
	const max = Math.max(0, ...items.flatMap((item) => [item.score, item.peak]));

	return Math.min(Math.ceil(max / STEP) * STEP, CEILING);
}
