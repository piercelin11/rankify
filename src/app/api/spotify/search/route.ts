import { NextResponse } from "next/server";
import getSpotifyToken from "@/lib/spotify/getSpotifyToken";
import { generateSearchParams } from "@/lib/helper";

export async function GET(req: NextResponse) {
	const accessToken = await getSpotifyToken();

	const url = new URL(req.url);
	const searchParams = url.searchParams.get("q") || "";

	try {
		const searchResponse = await fetch(
			"https://api.spotify.com/v1/search?" +
				generateSearchParams({
					q: searchParams,
					type: "artist",
					limit: "8",
				}),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const searchData = await searchResponse.json();
		return NextResponse.json(searchData);
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to search artist data.",
			},
			{ status: 500 }
		);
	}
}
