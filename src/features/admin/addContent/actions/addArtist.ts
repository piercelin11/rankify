"use server";

import fetchArtist from "@/lib/spotify/fetchArtist";
import { db } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { redirect } from "next/navigation";
import { AppResponseType } from "@/types/response";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import getTracksByArtist from "@/lib/database/data/getTracksByArtist";
import { revalidateTag } from "next/cache";
import { ADMIN_MESSAGES } from "@/constants/messages";

type AddArtistProps = {
	artistId: string;
	albumId: string | string[];
	token?: string;
};

export default async function addArtist({
	artistId,
	albumId,
	token,
}: AddArtistProps): Promise<AppResponseType> {
	let isSuccess = false;

	const artistData = await fetchArtist(artistId, token);

	if (!artistData){
		return { type: "error", message: ADMIN_MESSAGES.ARTIST.FETCH_NOT_FOUND };
	}

	const artistExists = await db.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	if (artistExists)
		return { type: "error", message: ADMIN_MESSAGES.ARTIST.ALREADY_EXISTS };

	try {
		await db.artist.create({
			data: {
				id: artistData.id,
				name: artistData.name,
				spotifyUrl: artistData.external_urls.spotify,
				img: artistData.images?.[0].url,
				spotifyFollowers: artistData.followers.total,
			},
		});
		try {
			if (Array.isArray(albumId) && albumId.length === 0)
				return {
					type: "error",
					message: ADMIN_MESSAGES.ALBUM_SELECTION_REQUIRED,
				};

			const albumData = Array.isArray(albumId)
				? await Promise.all(albumId.map((id) => fetchAlbum(id, token)))
				: [await fetchAlbum(albumId, token)];

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
						type: "ALBUM",
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
	} catch (error) {
		console.error(ADMIN_MESSAGES.ARTIST.ADD.FAILURE, error);
		return { type: "error", message: ADMIN_MESSAGES.ARTIST.ADD.FAILURE };
	}

	if (isSuccess) {
		revalidateTag("admin-data");
		redirect(`/admin/artist/${artistId}`);
	}
	return { type: "success", message: ADMIN_MESSAGES.ARTIST.ADD.SUCCESS };
}
