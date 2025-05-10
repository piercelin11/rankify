import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { generateSearchParams } from "@/lib/utils";
import { Track } from "spotify-types";

export default async function fetchAlbumsTrack(
	alabumId: string,
	token?: string
): Promise<Track[] | null> {
	let accessToken: string;
	if (token) accessToken = token;
	else accessToken = await getSpotifyToken();

	try {
		const response = await fetch(
			`https://api.spotify.com/v1/albums/${alabumId}/tracks?` +
				generateSearchParams({
					limit: "50",
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
		console.error("Failed to fetch albums's tracks", error);
		return null;
	}
}
