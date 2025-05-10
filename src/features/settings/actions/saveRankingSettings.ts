"use server";

import {
	rankingSettingsSchema,
	RankingSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "../../../../auth";
import { AppResponseType } from "@/types/response";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SETTINGS_MESSAGES } from "@/constants/messages";

export default async function saveRankingSettings(
	formData: RankingSettingsType
): Promise<AppResponseType> {
	const { id: userId } = await getUserSession();

	const validatedField = rankingSettingsSchema.safeParse(formData);
	if (!validatedField.success) {
		console.error(
			SETTINGS_MESSAGES.RANKING.ERROR_INVALID_FIELDS,
			validatedField.error.flatten()
		);
		return {
			type: "error",
			message: SETTINGS_MESSAGES.RANKING.ERROR_INVALID_FIELDS,
		};
	}
	const validatedData = validatedField.data;

	try {
		const existingUserPreference = await db.userPreference.findFirst({
			where: {
				userId,
			},
			select: {
				id: true,
			},
		});

		if (existingUserPreference) {
			const preference = await db.userPreference.update({
				where: {
					id: existingUserPreference.id,
					userId,
				},
				data: {
					rankingSettings: validatedData,
				},
			});
			console.log("action", preference);
		} else {
			await db.userPreference.create({
				data: {
					userId,
					rankingSettings: validatedData,
				},
			});
		}
	} catch (error) {
		console.error(SETTINGS_MESSAGES.RANKING.SAVE_FAILURE, error);
		return { type: "error", message: SETTINGS_MESSAGES.RANKING.SAVE_FAILURE };
	}
	revalidatePath("/settings/ranking");
	return {
		type: "success",
		message: SETTINGS_MESSAGES.RANKING.SAVE_SUCCESS,
	};
}
