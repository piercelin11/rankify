"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { requireAdmin } from "@/../auth";
import { resolveAlbumPreviewUrls } from "@/lib/itunes/resolveAlbumPreviewUrls";
import { revalidatePath } from "next/cache";

type FetchResult = {
	updated: number;
	failed: number;
	total: number;
};

export async function fetchAlbumPreviewUrls(
	albumId: string
): Promise<AppResponseType<FetchResult>> {
	try {
		await requireAdmin();

		const album = await db.album.findUnique({
			where: { id: albumId },
			include: {
				artist: true,
				tracks: {
					orderBy: [{ discNumber: { sort: "asc", nulls: "last" } }, { trackNumber: "asc" }],
				},
			},
		});

		if (!album || album.tracks.length === 0) {
			return {
				type: "info",
				message: "No tracks found for this album.",
				data: { updated: 0, failed: 0, total: 0 },
			};
		}

		const tracksToWrite = album.tracks.filter((t) => !t.previewUrl);

		if (tracksToWrite.length === 0) {
			return {
				type: "info",
				message: `All ${album.tracks.length} tracks already have preview URLs.`,
				data: { updated: 0, failed: 0, total: album.tracks.length },
			};
		}

		// Phase 1/2 still benefit from seeing the full album tracklist (more
		// candidate collections to discover from), but only tracksToWrite get
		// written to the database.
		const result = await resolveAlbumPreviewUrls({
			albumId: album.id,
			albumName: album.name,
			artistName: album.artist.name,
			tracks: album.tracks,
		});

		let updated = 0;
		let failed = 0;

		for (const track of tracksToWrite) {
			const newUrl = result.updates.get(track.id) ?? null;

			await db.track.update({
				where: { id: track.id },
				data: { previewUrl: newUrl },
			});

			if (newUrl) {
				updated++;
			} else {
				failed++;
			}
		}

		revalidatePath(`/admin/album/${albumId}`);

		return {
			type: "success",
			message: `Updated ${updated}/${tracksToWrite.length} tracks. (${failed} left without a preview)`,
			data: { updated, failed, total: album.tracks.length },
		};
	} catch (error) {
		console.error("fetchAlbumPreviewUrls error:", error);
		return {
			type: "error",
			message: "Failed to fetch preview URLs.",
			data: { updated: 0, failed: 0, total: 0 },
		};
	}
}
