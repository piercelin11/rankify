"use server";

import fetchArtist from "@/lib/spotify/fetchArtist";
import { db } from "@/db/client";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { redirect } from "next/navigation";
import { AppResponseType } from "@/types/response";
import getAlbumsByArtist from "@/lib/database/data/getAlbumsByArtist";
import getTracksByArtist from "@/lib/database/data/getTracksByArtist";
import { ADMIN_MESSAGES } from "@/constants/messages";
import { requireAdmin } from "@/../auth";
import { invalidateAdminCache } from "@/lib/cacheInvalidation";

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
	try {
		await requireAdmin();

		// 1. Validate artist data
		const artistData = await fetchArtist(artistId, token);
		if (!artistData) {
			return { type: "error", message: ADMIN_MESSAGES.ARTIST.FETCH_NOT_FOUND };
		}

		const artistExists = await db.artist.findFirst({ where: { id: artistId } });
		if (artistExists) {
			return { type: "error", message: ADMIN_MESSAGES.ARTIST.ALREADY_EXISTS };
		}

		if (Array.isArray(albumId) && albumId.length === 0) {
			return { type: "error", message: ADMIN_MESSAGES.ALBUM_SELECTION_REQUIRED };
		}

		// 2. Fetch related data from Spotify
		const albumData = Array.isArray(albumId)
			? await Promise.all(albumId.map((id) => fetchAlbum(id, token)))
			: [await fetchAlbum(albumId, token)];

		const trackData = Array.isArray(albumId)
			? (
					await Promise.all(
						albumId.map(
							async (id) =>
								(await fetchAlbumsTrack(id, token))?.map((track) => ({
									...track,
									album_id: id,
									img: albumData.find((album) => album?.id === id)?.images?.[0]
										.url,
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

		// 3. Filter out duplicates
		const savedAlbumsName = (await getAlbumsByArtist(artistId)).map(
			(album) => album.name
		);
		const savedTrackNames = (await getTracksByArtist(artistId)).map(
			(track) => track.name
		);

		const newAlbums = albumData
			.filter((album) => album !== null)
			.filter((album) => !savedAlbumsName.includes(album.name))
			.map((album) => ({
				id: album.id,
				name: album.name,
				artistId,
				spotifyUrl: album.external_urls.spotify,
				img: album.images?.[0].url,
				releaseDate: new Date(album.release_date),
				type: "ALBUM" as const,
			}));

		const newTracks = trackData
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
			}));

		// 4. Atomic transaction: artist + albums + tracks
		await db.$transaction(async (tx) => {
			await tx.artist.create({
				data: {
					id: artistData.id,
					name: artistData.name,
					spotifyUrl: artistData.external_urls.spotify,
					img: artistData.images?.[0].url,
					spotifyFollowers: artistData.followers.total,
				},
			});

			if (newAlbums.length > 0) {
				await tx.album.createMany({ data: newAlbums });
			}

			if (newTracks.length > 0) {
				await tx.track.createMany({ data: newTracks });
			}
		});

		await invalidateAdminCache('artist', artistId);
		redirect(`/admin/artist/${artistId}`);
	} catch (error) {
		console.error("addArtist error:", error);
		return { type: "error", message: ADMIN_MESSAGES.ARTIST.ADD.FAILURE };
	}
}
