// iTunes Search API allows roughly 20 requests per minute. All outbound
// requests across search.ts and lookup.ts go through this single throttle so
// callers never need to manage delays themselves.
const MIN_INTERVAL_MS = 3000;

let queue: Promise<void> = Promise.resolve();

function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function throttledFetch(url: string, init?: RequestInit): Promise<Response> {
	const run = queue.then(() => fetch(url, init));
	queue = run.then(
		() => delay(MIN_INTERVAL_MS),
		() => delay(MIN_INTERVAL_MS)
	);
	return run;
}
