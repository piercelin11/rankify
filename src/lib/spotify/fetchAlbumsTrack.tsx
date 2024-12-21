import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { generateSearchParams } from "../helper";
import { Track } from "spotify-types";

export default async function fetchAlbumsTrack(
    alabumId: string = "4VZ7jhV0wHpoNPCB7Vmiml",
): Promise<Track[] | null> {
    const accessToken = await getSpotifyToken();

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
        return null
    }
}