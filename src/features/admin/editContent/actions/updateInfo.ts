"use server";

import { ADMIN_MESSAGES } from "@/constants/messages";
import { db } from "@/db/client";
import fetchAlbum from "@/lib/spotify/fetchAlbum";
import fetchArtist from "@/lib/spotify/fetchArtist";
import { AppResponseType } from "@/types/response";
import { revalidatePath, revalidateTag } from "next/cache";

type UpdateInfoProps = {
	type: "artist" | "album";
	id: string;
	token?: string;
};

export default async function updateInfo({
	type,
	id,
	token,
}: UpdateInfoProps): Promise<AppResponseType> {
	let success = false;

	try {
		if (type === "album") {
			const album = await fetchAlbum(id, token);

			if (!album)
				return {
					type: "error",
					message: ADMIN_MESSAGES.ALBUM.UPDATE.ERROR_NOT_FOUND,
				};

			const albumData = await db.album.update({
				where: {
					id,
				},
				data: {
					img: album.images[0].url,
				},
			});
			await db.track.updateMany({
				where: {
					albumId: albumData.id,
				},
				data: {
					img: albumData.img,
				},
			});
		} else {
			const artist = await fetchArtist(id, token);

			if (!artist)
				return {
					type: "error",
					message: ADMIN_MESSAGES.ARTIST.UPDATE.ERROR_NOT_FOUND,
				};

			await db.artist.update({
				where: {
					id,
				},
				data: {
					img: artist.images[0].url,
					spotifyFollowers: artist.followers.total,
				},
			});
		}
		success = true;
	} catch (error) {
		console.error(
			ADMIN_MESSAGES.OPERATION_MESSAGES.UPDATE.FAILURE(type),
			error
		);
		return {
			type: "error",
			message: ADMIN_MESSAGES.OPERATION_MESSAGES.UPDATE.FAILURE(type),
		};
	}

	if (success) {
		revalidatePath(`/admin/${type}/${id}`);
		revalidateTag("admin-data");
	}
	return {
		type: "success",
		message: ADMIN_MESSAGES.OPERATION_MESSAGES.UPDATE.SUCCESS(type),
	};
}
