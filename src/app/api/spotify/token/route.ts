import { NextResponse } from "next/server";

let accessToken = "";
let tokenExpiredAt = 0;

async function getSpotifyToken() {
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	try {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
			},
			body: "grant_type=client_credentials",
		});

		if (!response.ok)
			throw new Error(
				`Failed to fetch Spotify token. HTTP status: ${response.status}`
			);

			

		const data = await response.json();

		accessToken = data.access_token;
		tokenExpiredAt = Date.now() + data.expires_in * 1000;
	} catch (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Unexpected error during Spotify token fetch."
		);
	}
}

export type SpotifyTokenRouteProps = {
	accessToken: string;
	tokenExpiredAt: number;
};

export async function GET() {
	try {
		if (!accessToken || Date.now() >= tokenExpiredAt) await getSpotifyToken();
		return NextResponse.json({ accessToken, tokenExpiredAt });
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to get spotify token",
			},
			{ status: 500 }
		);
	}
}
