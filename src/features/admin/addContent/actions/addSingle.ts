"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import { db } from "@/db/client";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { AppResponseType } from "@/types/response";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";

type AddSingleProps = {
	artistId: string;
	trackIds: string[];
	token?: string;
};

export default async function addSingle({
	artistId,
	trackIds,
	token,
}: AddSingleProps): Promise<AppResponseType> {
	await requireAdmin();

	let isSuccess = false;

	if (trackIds.length === 0)
		return {
			type: "error",
			message: ADMIN_MESSAGES.TRACK_SELECTION_REQUIRED,
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
		console.error(ADMIN_MESSAGES.SINGLE.ADD.FAILURE, error);
		return { type: "error", message: ADMIN_MESSAGES.SINGLE.ADD.FAILURE };
	}

	if (isSuccess) {
		revalidatePath(`/admin/artist/${artistId}`);
		revalidateTag("admin-data");
	}
	return { type: "success", message: ADMIN_MESSAGES.SINGLE.ADD.SUCCESS };
}
