export const TRACK_MATCH_THRESHOLD = 0.85;
export const ALBUM_MATCH_THRESHOLD = 0.75;
export const LOOSE_MATCH_THRESHOLD = 0.6;

// Suffixes that describe the same underlying song/album released in a
// different package (deluxe, remaster, single release, etc). These are
// stripped before comparison because they don't change the actual recording
// that a listener would expect to hear.
// Applied AFTER quote/punctuation normalization, so patterns only need to
// match ASCII apostrophes (smart quotes like ' are normalized away first).
const RELEASE_PACKAGING_SUFFIXES = [
	/\(\s*deluxe(\s+edition)?\s*\)/gi,
	/\(\s*expanded(\s+edition)?\s*\)/gi,
	/\(\s*anniversary(\s+edition)?\s*\)/gi,
	/\(\s*taylors\s+version\s*\)/gi,
	/\(\s*from\s+the\s+vault\s*\)/gi,
	/\(\s*remaster(ed)?(\s+\d{4})?\s*\)/gi,
	/\(\s*\d{4}\s+remaster(ed)?\s*\)/gi,
	/\(\s*explicit\s*\)/gi,
	/\(\s*clean\s*\)/gi,
	/\(\s*bonus\s+track\s*\)/gi,
	/\(\s*original\s+motion\s+picture\s+soundtrack\s*\)/gi,
	/\s*-\s*single\s*$/gi,
	/\s*-\s*ep\s*$/gi,
	/\(\s*single\s*\)/gi,
	/\(\s*ep\s*\)/gi,
];

function normalizeBrackets(input: string): string {
	return input.replace(/[［【]/g, "(").replace(/[］】]/g, ")").replace(/[\[\]]/g, (m) =>
		m === "[" ? "(" : ")"
	);
}

function normalizeFeatMarkers(input: string): string {
	return input.replace(/\b(feat\.?|ft\.?|featuring)\b/gi, "feat");
}

function stripReleasePackagingSuffixes(input: string): string {
	let result = input;
	let previous: string;

	do {
		previous = result;
		for (const pattern of RELEASE_PACKAGING_SUFFIXES) {
			result = result.replace(pattern, "");
		}
	} while (result !== previous);

	return result;
}

export function normalizeTitle(raw: string): string {
	let result = raw.toLowerCase().trim();

	result = normalizeBrackets(result);
	result = normalizeFeatMarkers(result);

	// Strip quotes/apostrophes and collapse non-alphanumeric noise BEFORE
	// stripping known suffixes, so suffix patterns (e.g. "taylors version")
	// only need to match ASCII text regardless of smart-quote variants.
	result = result
		.replace(/&/g, "and")
		.replace(/['’‘"“”]/g, "")
		.replace(/[^a-z0-9()]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	result = stripReleasePackagingSuffixes(result);
	result = result.replace(/\s+/g, " ").trim();

	return result;
}

function levenshteinDistance(a: string, b: string): number {
	const m = a.length;
	const n = b.length;

	if (m === 0) return n;
	if (n === 0) return m;

	let previousRow = Array.from({ length: n + 1 }, (_, i) => i);
	let currentRow = new Array(n + 1).fill(0);

	for (let i = 1; i <= m; i++) {
		currentRow[0] = i;
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			currentRow[j] = Math.min(
				previousRow[j] + 1,
				currentRow[j - 1] + 1,
				previousRow[j - 1] + cost
			);
		}
		[previousRow, currentRow] = [currentRow, previousRow];
	}

	return previousRow[n];
}

/**
 * Returns a similarity score in [0, 1] between two raw titles after
 * normalization. 1 means identical after normalization, 0 means completely
 * different.
 */
export function titlesMatch(a: string, b: string): number {
	const normA = normalizeTitle(a);
	const normB = normalizeTitle(b);

	if (normA === normB) return 1;

	const maxLen = Math.max(normA.length, normB.length);
	if (maxLen === 0) return 1;

	const distance = levenshteinDistance(normA, normB);
	return 1 - distance / maxLen;
}

/**
 * Strips ALL parenthetical content (feat., remix, live, everything) before
 * normalizing. Used only as a last-resort loose comparison after strict
 * matching (titlesMatch) has already failed for a track, to recover cases
 * where the only recording iTunes has carries a "(feat. X)" tag that the
 * local title doesn't.
 */
export function normalizeTitleLoose(raw: string): string {
	const withoutParens = raw.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ");
	return normalizeTitle(withoutParens);
}

export function titlesMatchLoose(a: string, b: string): number {
	const normA = normalizeTitleLoose(a);
	const normB = normalizeTitleLoose(b);

	if (normA === normB) return 1;

	const maxLen = Math.max(normA.length, normB.length);
	if (maxLen === 0) return 1;

	const distance = levenshteinDistance(normA, normB);
	return 1 - distance / maxLen;
}
