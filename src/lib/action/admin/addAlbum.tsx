"use server";

import { prisma } from "@/lib/prisma";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchAlbumsTrack from "@/lib/spotify/fetchAlbumsTrack";
import { revalidatePath } from "next/cache";

export default async function addAlbum(
	albumId: string | string[],
	artistId: string,
	revalidate?: string
) {
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
										img: albumData.find(album => album?.id === id)?.images?.[0].url
									})) || null
							)
						)
					).flat()
				: (await fetchAlbumsTrack(albumId))?.map((track) => ({
						...track,
						album_id: albumId,
						img: albumData.find(album => album?.id === albumId)?.images?.[0].url
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
						img: track.img
					})),
			});
			revalidatePath(revalidate || "/");
		} catch (error) {
			throw new Error(`Failed to add album's tracks. error: ${error}`);
		}
		
	} catch (error) {
		throw new Error(`Failed to add album. error: ${error}`);
	}

	
}
