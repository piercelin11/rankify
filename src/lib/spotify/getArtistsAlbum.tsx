import { generateSearchParams } from "@/lib/helper";
import getSpotifyToken from "@/lib/spotify/getSpotifyToken";

export default async function getArtistsAlbum(
	artistId: string,
	limit: number = 20,
	type: "album" | "single" | "appears_on" | "compilation" = "album"
) {
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
		return data;
	} catch (error) {
		console.error("Failed to fetch artist's albums", error);
	}
}
