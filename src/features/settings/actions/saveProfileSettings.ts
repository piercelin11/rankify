"use server";

import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/lib/schemas/settings";
import { getUserSession } from "@/../auth";
import { AppResponseType } from "@/types/response";
import { db } from "@/db/client";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { SETTINGS_MESSAGES } from "@/constants/messages";

export default async function saveProfileSettings(
	formData: ProfileSettingsType
): Promise<AppResponseType> {
	const { id: userId } = await getUserSession();

	const validatedField = profileSettingsSchema.safeParse(formData);
	if (!validatedField.success) {
		console.error(
			SETTINGS_MESSAGES.PROFILE.ERROR_INVALID_FIELDS,
			validatedField.error.flatten()
		);
		return {
			type: "error",
			message: SETTINGS_MESSAGES.PROFILE.ERROR_INVALID_FIELDS,
		};
	}
	const validatedData = validatedField.data;

	try {
		const existedUser = await db.user.findUnique({
			where: {
				username: validatedData.username,
			},
			select: {
				id: true,
			},
		});

		if (existedUser && existedUser.id !== userId)
			return { type: "error", message: SETTINGS_MESSAGES.PROFILE.USERNAME_EXISTS_ERROR };

		const updatePayload: Prisma.UserUpdateInput = {
			name: validatedData.name,
			username: validatedData.username,
		};

		await db.user.update({
			where: {
				id: userId,
			},
			data: updatePayload,
		});
	} catch (error) {
		console.error(SETTINGS_MESSAGES.PROFILE.SAVE_FAILURE, error);
		return { type: "error", message: SETTINGS_MESSAGES.PROFILE.SAVE_FAILURE };
	}
	revalidatePath("/settings/profile");
	return {
		type: "success",
		message: SETTINGS_MESSAGES.PROFILE.SAVE_SUCCESS,
	};
}
