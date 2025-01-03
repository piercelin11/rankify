"use server";

import getAlbumsByArtist from "@/lib/data/getAlbumsByArtist";
import getTracksByArtist from "@/lib/data/getTracksByArtist";
import { db } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { ActionResponse } from "@/types/action";
import { revalidatePath, revalidateTag } from "next/cache";

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
		const savedAlbumsName = (await getAlbumsByArtist(artistId)).map(
			(album) => album.name
		);

		await db.album.createMany({
			data: albumData
				.filter((album) => album !== null)
				.filter((album) => !savedAlbumsName.includes(album.name))
				.map((album) => ({
					id: album.id,
					name: album.name,
					artistId,
					spotifyUrl: album.external_urls.spotify,
					img: album.images?.[0].url,
					releaseDate: new Date(album.release_date),
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

			await db.track.createMany({
				data: trackData
					.filter((track) => track !== null)
					.filter((track) => !savedTrackNames.includes(track.name))
					.filter(
						(item, index, array) =>
							index === array.findIndex((track) => track.name === item.name)
					)
					.map((track) => ({
						id: track.id,
						name: track.name,
						albumId: track.album_id,
						trackNumber: track.track_number,
						discNumber: track.disc_number,
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

	if (isSuccess) {
		revalidateTag("admin-data");
		revalidatePath(`/admin/artist/${artistId}`);
	}
	return { success: true, message: "Successfully added albums." };
}
