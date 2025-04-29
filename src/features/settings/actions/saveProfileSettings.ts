"use server";

import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "../../../../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function saveProfileSettings(
	data: ProfileSettingsType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();

	const validatedField = profileSettingsSchema.safeParse(data);
	if (!validatedField)
		return { success: false, message: "Invalid Field", error: "Invalid Field" };

	try {
		const existedUsername = await db.user.findFirst({
			where: {
				username: data.username,
			},
			select: {
				id: true,
			},
		});

		if (existedUsername)
			return { success: false, message: "Username already exist." };

		await db.user.update({
			where: {
				id: userId,
			},
			data,
		});
	} catch (error) {
		console.error("Failed to save profile settings:", error);
		return { success: false, message: "Failed to save profile settings." };
	}
	revalidatePath("/settings/profile");
	return { success: true, message: "Profile settings is successfully saved." };
}
