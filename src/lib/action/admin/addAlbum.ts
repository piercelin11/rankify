"use server";

import getTracksByAlbum from "@/lib/data/getTracksByAlbum";
import getTracksByArtist from "@/lib/data/getTracksByArtist";
import { prisma } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

export default async function addAlbum(
	artistId: string,
	albumId: string | string[],
	type: "ALBUM" | "EP"
): Promise<ActionResponse> {
	let isSuccess = false;

	if (Array.isArray(albumId) && albumId.length === 0)
		return { success: false, message: "You need to at least select an album." };

	const albumData = Array.isArray(albumId)
		? await Promise.all(albumId.map((id) => fetchAlbum(id)))
		: [await fetchAlbum(albumId)];

	try {
		await prisma.album.createMany({
			data: albumData
				.filter((data) => data !== null)
				.map((data) => ({
					id: data.id,
					name: data.name,
					artistId,
					spotifyUrl: data.external_urls.spotify,
					img: data.images?.[0].url,
					releaseDate: new Date(data.release_date),
					type,
				})),
		});
		try {
			const trackData = Array.isArray(albumId)
				? (
						await Promise.all(
							albumId.map(
								async (id) =>
									(await fetchAlbumsTrack(id))?.map((track) => ({
										...track,
										album_id: id,
										img: albumData.find((album) => album?.id === id)
											?.images?.[0].url,
									})) || null
							)
						)
					).flat()
				: (await fetchAlbumsTrack(albumId))?.map((track) => ({
						...track,
						album_id: albumId,
						img: albumData.find((album) => album?.id === albumId)?.images?.[0]
							.url,
					})) || [null];

			const savedTrackNames = (await getTracksByArtist(artistId)).map(
				(track) => track.name
			);

			await prisma.track.createMany({
				data: trackData
					.filter((track) => track !== null)
					.filter((track) => !savedTrackNames.includes(track.name))
					.map((track) => ({
						id: track.id,
						name: track.name,
						albumId: track.album_id,
						trackNumber: track.track_number,
						artistId,
						spotifyUrl: track.external_urls.spotify,
						img: track.img,
					})),
			});

			isSuccess = true;
		} catch (error) {
			console.error("Failed to add album's track:", error);
			return { success: false, message: "Failed to add album's tracks." };
		}
	} catch (error) {
		console.error("Failed to add album. error:", error);
		return { success: false, message: "Failed to add albums." };
	}

	if (isSuccess) revalidatePath(`/admin/artist/${artistId}`);
	return { success: true, message: "Successfully added albums." };
}
