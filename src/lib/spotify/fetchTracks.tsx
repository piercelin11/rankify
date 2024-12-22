import getSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { Album, Track } from "spotify-types";
import { generateSearchParams } from "../helper";

export default async function fetchTracks(
    TrackIds: string[]
): Promise<Track[] | null> {
    const accessToken = await getSpotifyToken();

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks?` + generateSearchParams({
                ids: TrackIds.join(",")
            }),
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const data = await response.json();
        console.log(data.tracks)
        return data.tracks;
    } catch (error) {
        console.error("Failed to fetch tracks' data", error);
        return null;
    }
}
