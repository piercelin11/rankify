import { throttledFetch } from "@/lib/itunes/rateLimiter";
import { ItunesLookupResponse, ItunesSongResult } from "@/lib/itunes/types";

export async function lookupCollectionTracks(
	collectionId: number
): Promise<ItunesSongResult[]> {
	const url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`;

	try {
		const res = await throttledFetch(url, { cache: "no-store" });
		if (!res.ok) return [];

		const data: ItunesLookupResponse = await res.json();
		// The first result of a lookup by collectionId is the collection
		// itself; actual tracks have their own trackId/trackName.
		return (data.results ?? []).filter((r) => r.trackName);
	} catch {
		return [];
	}
}
