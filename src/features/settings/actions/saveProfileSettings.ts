"use server";

import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "@/../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import uploadImageToS3 from "./uploadImageToS3";
import { Prisma } from "@prisma/client";

export default async function saveProfileSettings(
	data: ProfileSettingsType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();

	const validatedField = profileSettingsSchema.safeParse(data);
	if (!validatedField.success) {
		console.error(
			"Profile settings validation failed:",
			validatedField.error.flatten()
		);
		return {
			success: false,
			message: "Invalid field data.",
			error: validatedField.error.flatten().fieldErrors,
		};
	}
	const validatedData = validatedField.data;

	let s3Url: string | undefined;

	try {
		if (validatedData.image) {
			const currentUser = await db.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					image: true,
				},
			});
			s3Url = await uploadImageToS3({
				imageFile: validatedData.image[0] as File,
				oldImageUrl: currentUser?.image || null,
			});
		}

		const existedUser = await db.user.findUnique({
			where: {
				username: validatedData.username,
			},
			select: {
				id: true,
			},
		});

		if (existedUser && existedUser.id !== userId)
			return { success: false, message: "Username already exist." };

		const updatePayload: Prisma.UserUpdateInput = {
			name: validatedData.name,
			username: validatedData.username,
		};

		if (s3Url) updatePayload.image = s3Url;

		await db.user.update({
			where: {
				id: userId,
			},
			data: updatePayload,
		});
	} catch (error) {
		console.error("Failed to save profile settings:", error);
		return { success: false, message: "Failed to save profile settings." };
	}
	revalidatePath("/settings/profile");
	return { success: true, message: "Profile settings is successfully saved." };
}
