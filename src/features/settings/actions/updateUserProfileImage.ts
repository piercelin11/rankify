"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";
import { AppResponseType } from "@/types/response.types";
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
		console.error("Error updating profile picture:", err);
		return { type: "error", message: "Error updating profile picture." };
	}
	revalidatePath("/settings");
	return {
		type: "success",
		message: "Successfully updated your profile picture.",
	};
}
