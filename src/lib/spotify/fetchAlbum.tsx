import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { Album } from "spotify-types";

export default async function fetchAlbum(
	albumId: string,
	token?: string
): Promise<Album | null> {
	let accessToken: string;
	if (token) accessToken = token;
	else accessToken = await getSpotifyToken();

	try {
		const response = await fetch(
			`https://api.spotify.com/v1/albums/${albumId}`,
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
		console.error("Failed to fetch albums data", error);
		return null;
	}
}
