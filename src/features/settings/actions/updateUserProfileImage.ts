"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";
import { ActionResponse } from "@/types/action";
import { revalidatePath } from "next/cache";

type UpdateUserProfileImageProps = {
	imageUrl: string;
};

export default async function updateUserProfileImage({
	imageUrl,
}: UpdateUserProfileImageProps): Promise<ActionResponse> {
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
		return { success: false, message: "Error updating profile picture." };
	}
	revalidatePath("/settings");
	return {
		success: true,
		message: "Successfully updated your profile picture.",
	};
}
