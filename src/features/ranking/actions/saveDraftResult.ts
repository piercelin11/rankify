"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";
import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { revalidatePath } from "next/cache";

export default async function saveDraftResult(
    artistId: string,
    result: RankingResultData[],
    draft?: string,
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
                    result,
                    draft
                },
            });
        else
            await db.rankingDraft.update({
                where: {
                    id: existingDraft.id,
                },
                data: {
                    result,
                    draft
                },
            });

        isSuccess = true;
    } catch (error) {
        console.error("Failed to save draft result:", error);
        return { type: "error", message: "Failed to save draft result" };
    }

    revalidatePath(`/sorter/${artistId}/result`);
    return { type: "success", message: "Draft result is successfully saved." };
}
