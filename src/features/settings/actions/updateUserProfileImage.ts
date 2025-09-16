"use server";

import { getUserSession } from "@/../auth";
import { SETTINGS_MESSAGES } from "@/constants/messages";
import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { revalidatePath } from "next/cache";

type UpdateUserProfileImageProps = {
	imageUrl: string;
};

export default async function updateUserProfileImage({
	imageUrl,
}: UpdateUserProfileImageProps): Promise<AppResponseType> {
	const { id: userId } = await getUserSession();

	try {
		await db.user.update({
			where: {
				id: userId,
			},
			data: {
				image: imageUrl,
			},
		});
	} catch (err) {
		console.error(SETTINGS_MESSAGES.PROFILE_IMAGE.UPDATE_FAILURE, err);
		return { type: "error", message: SETTINGS_MESSAGES.PROFILE_IMAGE.UPDATE_FAILURE };
	}
	revalidatePath("/settings");
	return {
		type: "success",
		message: SETTINGS_MESSAGES.PROFILE_IMAGE.UPDATE_SUCCESS,
	};
}
