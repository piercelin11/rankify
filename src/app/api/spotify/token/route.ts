import { NextResponse } from "next/server";

let accessToken = "";
let tokenExpiry = 0;

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
			throw new Error(`Failed to fetch spotify token: ${response.status}`);

		const data = await response.json();

		accessToken = data.access_token;
		tokenExpiry = Date.now() + data.expires_in * 1000;
	} catch (error) {
		console.error("Error fetching spotify token.");
	}
}

export async function GET() {
	try {
		if (!accessToken || Date.now() >= tokenExpiry) await getSpotifyToken();
		return NextResponse.json(accessToken);
	} catch (error) {
		if (error instanceof Error)
			return NextResponse.json({ error: error.message, status: 500 });
		else
			return NextResponse.json({
				error: "Failed to get spotify token",
				status: 500,
			});
	}
}
