"use server";

import {
	rankingSettingsSchema,
	RankingSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "../../../../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";

export default async function saveRankingSettings(
	data: RankingSettingsType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();

	const validatedField = rankingSettingsSchema.safeParse(data);
	if (!validatedField)
		return { success: false, message: "Invalid Field", error: "Invalid Field" };

    try {
        const existingUserPreference = await db.userPreference.findFirst({
            where: {
                userId,
            }
        })

        if (existingUserPreference) {
            await db.userPreference.update({
                where: {
                    id: existingUserPreference.id
                },
                data: {
                    rankingSettings: data
                }
            })
        } else {
            await db.userPreference.create({
                data: {
                    userId,
                    rankingSettings: data
                }
            })
        }

    } catch (error) {
        console.error("Failed to save ranking settings:", error);
		return { success: false, message: "Failed to save ranking settings." };
    }

	return { success: true, message: "Ranking settings is successfully saved." };
}
