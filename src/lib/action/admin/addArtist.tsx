"use server";

import getArtist from "@/lib/spotify/fetchArtist";
import { prisma } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { redirect } from "next/navigation";
import { ActionResponse } from "@/types/action";

export default async function addArtist(
	artistId: string,
	albumId: string | string[]
): Promise<ActionResponse> {
	let isSuccess = false;

	const artistData = await getArtist(artistId);

	if (!artistData)
		throw new Error("Can't find any artist matching the given artist id.");

	const artistExists = await prisma.artist.findFirst({
		where: {
			id: artistId,
		},
	});

	if (artistExists)
		return { success: false, message: "This artist already exists." };

	try {
		await prisma.artist.create({
			data: {
				id: artistData.id,
				name: artistData.name,
				spotifyUrl: artistData.external_urls.spotify,
				img: artistData.images?.[0].url,
				spotifyFollowers: artistData.followers.total,
			},
		});
		try {
			const albumData = Array.isArray(albumId)
				? await Promise.all(albumId.map((id) => fetchAlbum(id)))
				: [await fetchAlbum(albumId)];

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

				await prisma.track.createMany({
					data: trackData
						.filter((data) => data !== null)
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
				return {
					success: false,
					message: "Failed to add album's track.",
				};
			}
		} catch (error) {
			console.error("Failed to add album. error:", error);
			return { success: false, message: "Failed to add album's track." };
		}
	} catch (error) {
		console.error("Failed to add artist:", error);
		return { success: false, message: "Failed to add artist." };
	}

	if (isSuccess) redirect(`/admin/artist/${artistId}`);
	return { success: true, message: "Successfully added the artist." };
}
