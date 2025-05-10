"use server";

import {
	rankingSettingsSchema,
	RankingSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "../../../../auth";
import { AppResponseType } from "@/types/response.types";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function saveRankingSettings(
	data: RankingSettingsType
): Promise<AppResponseType> {
	const { id: userId } = await getUserSession();

	const validatedField = rankingSettingsSchema.safeParse(data);
	if (!validatedField)
		return { type: "error", message: "Invalid Field", error: "Invalid Field" };

	try {
		const existingUserPreference = await db.userPreference.findFirst({
			where: {
				userId,
			},
			select: {
				id: true,
			},
		});

		if (existingUserPreference ) {
			const preference = await db.userPreference.update({
				where: {
					id: existingUserPreference.id,
                    userId,
				},
				data: {
					rankingSettings: data,
				},
			});
			console.log("action", preference);
		} else {
			await db.userPreference.create({
				data: {
					userId,
					rankingSettings: data,
				},
			});
		}
	} catch (error) {
		console.error("Failed to save ranking settings:", error);
		return { type: "error", message: "Failed to save ranking settings." };
	}
    revalidatePath("/settings/ranking")
	return { type: "success", message: "Ranking settings is successfully saved." };
}
