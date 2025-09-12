import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { Track } from "spotify-types";
import { generateSearchParams } from "@/lib/utils";

export default async function fetchTracks(
	TrackIds: string[],
	token?: string
): Promise<Track[] | null> {
	let accessToken: string;
	if (token) accessToken = token;
	else accessToken = await getSpotifyToken();

	try {
		const response = await fetch(
			`https://api.spotify.com/v1/tracks?` +
				generateSearchParams({
					ids: TrackIds.join(","),
				}),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const data = await response.json();
		return data.tracks;
	} catch (error) {
		console.error("Failed to fetch tracks' data", error);
		return null;
	}
}
