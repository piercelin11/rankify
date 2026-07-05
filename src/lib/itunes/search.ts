import { throttledFetch } from "@/lib/itunes/rateLimiter";
import { ItunesSearchResponse, ItunesSongResult } from "@/lib/itunes/types";

export async function searchSongs(
	term: string,
	limit = 5
): Promise<ItunesSongResult[]> {
	const encodedTerm = encodeURIComponent(term);
	const url = `https://itunes.apple.com/search?term=${encodedTerm}&entity=song&limit=${limit}`;

	try {
		const res = await throttledFetch(url, { cache: "no-store" });
		if (!res.ok) return [];

		const data: ItunesSearchResponse = await res.json();
		return data.results ?? [];
	} catch {
		return [];
	}
}
