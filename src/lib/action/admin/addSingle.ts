"use server"; 

import { db } from "@/lib/prisma";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { ActionResponse } from "@/types/action";
import { revalidatePath, revalidateTag } from "next/cache";

export default async function addSingle(
	artistId: string,
	trackIds: string[],
	token?: string,
): Promise<ActionResponse> {
	let isSuccess = false;

	if (trackIds.length === 0)
		return {
			success: false,
			message: "You need to at least select a single.",
		};

	try {
		const tracksData = await fetchTracks(trackIds, token);

		if (tracksData)
			await db.track.createMany({
				data: tracksData.map((track) => ({
					id: track.id,
					name: track.name,
					artistId,
					spotifyUrl: track.external_urls.spotify,
					img: track.album.images?.[0].url,
					releaseDate: new Date(track.album.release_date),
				})),
			});

		isSuccess = true;
	} catch (error) {
		console.error("Failed to add single:", error);
		return { success: false, message: "Failed to add singles." };
	}

	if (isSuccess) {
		revalidatePath(`/admin/artist/${artistId}`);
		revalidateTag("admin-data");
	}
	return { success: true, message: "Successfully added singles." };
}
