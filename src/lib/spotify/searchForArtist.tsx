import { generateSearchParams } from "../helper";
import getSpotifyToken from "./getSpotifyToken";

export default async function searchForArtist(searchQuery: string) {
	const accessToken = await getSpotifyToken();

	try {
		const searchResponse = await fetch(
			"https://api.spotify.com/v1/search?" +
				generateSearchParams({
					q: searchQuery,
					type: "artist",
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
	}
}
