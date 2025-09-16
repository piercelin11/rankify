"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import getTracksByArtist from "@/lib/database/data/getTracksByArtist";
import { db } from "@/db/client";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { AppResponseType } from "@/types/response";
import { revalidatePath, revalidateTag } from "next/cache";

type AddAlbumProps = {
	artistId: string;
	albumId: string | string[];
	type: "ALBUM" | "EP";
	token?: string;
};

export default async function addAlbum({
	artistId,
	albumId,
	type,
	token,
}: AddAlbumProps): Promise<AppResponseType> {
	let isSuccess = false;

	if (Array.isArray(albumId) && albumId.length === 0)
		return { type: "error", message: ADMIN_MESSAGES.ALBUM_SELECTION_REQUIRED };

	const albumData = Array.isArray(albumId)
		? await Promise.all(albumId.map((id) => fetchAlbum(id, token)))
		: [await fetchAlbum(albumId, token)];

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
									(await fetchAlbumsTrack(id, token))?.map((track) => ({
										...track,
										album_id: id,
										img: albumData.find((album) => album?.id === id)
											?.images?.[0].url,
									})) || null
							)
						)
					).flat()
				: (await fetchAlbumsTrack(albumId, token))?.map((track) => ({
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
			console.error(ADMIN_MESSAGES.TRACK.ADD.FAILURE, error);
			return { type: "error", message: ADMIN_MESSAGES.TRACK.ADD.FAILURE };
		}
	} catch (error) {
		console.error(ADMIN_MESSAGES.ALBUM.ADD.FAILURE, error);
		return { type: "error", message: ADMIN_MESSAGES.ALBUM.ADD.FAILURE };
	}

	if (isSuccess) {
		revalidateTag("admin-data");
		revalidatePath(`/admin/artist/${artistId}`);
	}
	return { type: "success", message: ADMIN_MESSAGES.ALBUM.ADD.SUCCESS };
}
