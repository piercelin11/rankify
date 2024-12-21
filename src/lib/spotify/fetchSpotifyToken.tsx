import { SpotifyTokenRouteProps } from "@/app/api/spotify/token/route";

export default async function fetchSpotifyToken() {
  const tokenResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/token`
    );
  
    if (!tokenResponse.ok)
        throw new Error(
            `Failed to get token when searching. HTTP status: ${tokenResponse.status}`
        );
  
    const tokenData: SpotifyTokenRouteProps = await tokenResponse.json();
    const accessToken = tokenData.accessToken;

    return accessToken;
}
