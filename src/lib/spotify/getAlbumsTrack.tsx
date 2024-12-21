import getSpotifyToken from "@/lib/spotify/getSpotifyToken";
import { generateSearchParams } from "../helper";

const alabumId = "4VZ7jhV0wHpoNPCB7Vmiml"

export default async function getAlbumsTrack(
    alabumId: string = "4VZ7jhV0wHpoNPCB7Vmiml",
    limit: number = 20,
) {
    const accessToken = await getSpotifyToken();

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/albums/${alabumId}/tracks?` +
                generateSearchParams({
                    limit: `${limit}`,
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
        console.error("Failed to fetch albums's tracks", error);
    }
}