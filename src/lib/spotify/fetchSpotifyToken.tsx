import { SpotifyTokenRouteProps } from "@/app/api/spotify/token/route";

export default async function fetchSpotifyToken() {
	const tokenResponse = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/token`,
		{
			credentials: "include",
		}
	);

	if (!tokenResponse.ok)
		throw new Error(
			`Failed to get token when searching. HTTP status: ${tokenResponse.status}`
		);

	const contentType = tokenResponse.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		throw new Error("Invalid response type. Expected JSON.");
	}

	const tokenData: SpotifyTokenRouteProps = await tokenResponse.json();
	const accessToken = tokenData.accessToken;

	return accessToken;
}
