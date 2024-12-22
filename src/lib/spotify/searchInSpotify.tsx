import { SearchContent } from "spotify-types";
import { generateSearchParams } from "../helper";
import getSpotifyToken from "./fetchSpotifyToken";

export default async function searchInSpotify(
	searchQuery: string,
	type: "album" | "artist" | "track"
): Promise<SearchContent | null> {
	const accessToken = await getSpotifyToken();

	try {
		const searchResponse = await fetch(
			"https://api.spotify.com/v1/search?" +
				generateSearchParams({
					q: searchQuery,
					type,
					limit: "8",
				}),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const searchData = await searchResponse.json();
		return searchData;
	} catch (error) {
		console.error("Failed to search artist data.", error);
		return null;
	}
}
