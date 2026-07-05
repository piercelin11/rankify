"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { requireAdmin } from "@/../auth";
import { fetchTrackPreviewDirect } from "@/lib/itunes/fetchPreviewUrl";
import { revalidatePath } from "next/cache";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";

export async function fetchTrackPreviewUrl(
	trackId: string
): Promise<AppResponseType> {
	try {
		await requireAdmin();

		const track = await db.track.findUnique({
			where: { id: trackId },
			include: { artist: true },
		});

		if (!track) {
			return { type: "error", message: "Track not found." };
		}

		const result = await fetchTrackPreviewDirect(track.name, track.artist.name);

		if (!result.matched || !result.previewUrl) {
			return { type: "info", message: "No preview URL found for this track." };
		}

		await db.track.update({
			where: { id: trackId },
			data: { previewUrl: result.previewUrl },
		});

		revalidatePath("/admin");
		revalidatePath(`/admin/artist/${track.artistId}`);
		if (track.albumId) {
			revalidatePath(`/admin/album/${track.albumId}`);
		}
		await invalidateAdminCache("track", trackId);

		return { type: "success", message: "Preview URL updated successfully." };
	} catch (error) {
		console.error("fetchTrackPreviewUrl error:", error);
		return { type: "error", message: "Failed to fetch preview URL." };
	}
}
