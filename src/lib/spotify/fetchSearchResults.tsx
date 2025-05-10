import { Album, Artist, Track } from "spotify-types";
import { generateSearchParams } from "@/lib/utils";
import getSpotifyToken from "./fetchSpotifyToken";

export type SpotifyTypeMap = {
	album: Album[];
	artist: Artist[];
	track: Track[];
};

export default async function fetchSearchResults<
	T extends keyof SpotifyTypeMap,
>(
	searchQuery: string,
	type: T,
	limit?: number
): Promise<SpotifyTypeMap[T] | null> {
	const accessToken = await getSpotifyToken();

	try {
		const searchResponse = await fetch(
			"https://api.spotify.com/v1/search?" +
				generateSearchParams({
					q: searchQuery,
					type,
					limit: limit ? `${limit}` : "8",
				}),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const searchData = await searchResponse.json();
		return (searchData[`${type}s`]?.items as SpotifyTypeMap[T]) ?? null;
	} catch (error) {
		console.error("Failed to search artist data.", error);
		return null;
	}
}
