"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";
import { RankingResultData } from "@/components/sorter/SorterField";

export default async function saveRankingDraft(
    artistId: string,
    result: RankingResultData[]
) {
    const { id: userId } = await getUserSession();
    let isSuccess = false;

    const existingDraft = await db.rankingDraft.findFirst({
        where: {
            artistId,
            userId,
        },
    });

    try {
        if (!existingDraft)
            await db.rankingDraft.create({
                data: {
                    userId,
                    artistId,
                    result: JSON.stringify(result)
                },
            });
        else
            await db.rankingDraft.update({
                where: {
                    id: existingDraft.id,
                },
                data: {
                    result: JSON.stringify(result)
                },
            });

        isSuccess = true;
    } catch (error) {
        console.error("Failed to save draft result:", error);
        return { success: false, message: "Failed to save draft result" };
    }

    return { success: true, message: "Draft result is successfully saved." };
}
