import { generateSearchParams } from "@/lib/helper";
import getSpotifyToken from "@/lib/spotify/getSpotifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const accessToken = await getSpotifyToken();

	const url = new URL(req.url);

	const artistId = url.searchParams.get("artistId");
	const limit = url.searchParams.get("limit");
	const type = url.searchParams.get("type");

	try {
		const response = await fetch(
			`https://api.spotify.com/v1/artists/${artistId}/albums?` +
				generateSearchParams({
					limit: limit || "20",
					include_groups: type || "album",
				}),
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		const data = await response.json();

		return NextResponse.json({ data });
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch artist's albums",
			},
			{ status: 500 }
		);
	}
}
