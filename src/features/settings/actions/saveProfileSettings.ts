"use server";

import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "../../../../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import uploadImageToS3 from "./uploadImageToS3";

export default async function saveProfileSettings(
	data: ProfileSettingsType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();

	const validatedField = profileSettingsSchema.safeParse(data);
	if (!validatedField)
		return { success: false, message: "Invalid Field", error: "Invalid Field" };

	let s3Url: string | undefined;

	try {
		
		if (data.image) {
			const currentUser = await db.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					image: true,
				},
			});
			s3Url = await uploadImageToS3({
				imageFile: data.image[0] as File,
				oldImageUrl: currentUser?.image || null,
			});
		}

		const existedUser = await db.user.findUnique({
			where: {
				username: data.username,
			},
			select: {
				id: true,
			},
		});

		if (existedUser && existedUser.id !== userId)
			return { success: false, message: "Username already exist." };

		await db.user.update({
			where: {
				id: userId,
			},
			data: {
				name: data.name,
				username: data.username,
				image: s3Url,
			},
		});
	} catch (error) {
		console.error("Failed to save profile settings:", error);
		return { success: false, message: "Failed to save profile settings." };
	}
	revalidatePath("/settings/profile");
	return { success: true, message: "Profile settings is successfully saved." };
}
