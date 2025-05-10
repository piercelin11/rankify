import { generateSearchParams } from "@/lib/utils";
import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { Album } from "spotify-types";

export default async function fetchArtistsAlbum(
	artistId: string,
	limit: number = 20, 
	type: "album" | "single" | "appears_on" | "compilation" = "album"
): Promise<Album[] | null> {
	const accessToken = await getSpotifyToken();

	try {
		const response = await fetch(
			`https://api.spotify.com/v1/artists/${artistId}/albums?` +
				generateSearchParams({
					limit: `${limit}`,
					include_groups: type,
				}),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const data = await response.json();
		return data.items;
	} catch (error) {
		console.error("Failed to fetch artist's albums", error);
        return null
	}
}
