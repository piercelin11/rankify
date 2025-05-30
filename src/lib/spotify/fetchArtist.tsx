import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { Artist } from "spotify-types";

export default async function fetchArtist(
	artistId: string,
	token?: string
): Promise<Artist | null> {
	let accessToken: string;
	if (token) accessToken = token;
	else accessToken = await getSpotifyToken();

	try {
		const response = await fetch(
			`https://api.spotify.com/v1/artists/${artistId}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to fetch artist data", error);
		return null;
	}
}
