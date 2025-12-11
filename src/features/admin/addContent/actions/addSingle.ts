"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import { db } from "@/db/client";
import fetchTracks from "@/lib/spotify/fetchTracks";
import { AppResponseType } from "@/types/response";
import { revalidatePath } from "next/cache";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";
import { requireAdmin } from "@/../auth";

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
	try {
		await requireAdmin();

		if (trackIds.length === 0) {
			return {
				type: "error",
				message: ADMIN_MESSAGES.TRACK_SELECTION_REQUIRED,
			};
		}

		const tracksData = await fetchTracks(trackIds, token);

		if (tracksData && tracksData.length > 0) {
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
		}

		revalidatePath(`/admin/artist/${artistId}`);
		await invalidateAdminCache('track', artistId);
		return { type: "success", message: ADMIN_MESSAGES.SINGLE.ADD.SUCCESS };
	} catch (error) {
		console.error("addSingle error:", error);
		return { type: "error", message: ADMIN_MESSAGES.SINGLE.ADD.FAILURE };
	}
}
