"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { RankingResultData } from "@/features/sorter/components/SortingStage";
import { revalidatePath } from "next/cache";
import { $Enums } from "@prisma/client";

export default async function saveDraftResult(
    artistId: string,
    result: RankingResultData[],
    type: $Enums.SubmissionType,
    albumId?: string,
    draft?: string,
) {
    const { id: userId } = await getUserSession();

    const existingDraft = await db.rankingSubmission.findFirst({
        where: {
            artistId,
            userId,
            type,
            albumId: albumId || null,
            status: "DRAFT",
        },
    });

    try {
        if (!existingDraft)
            await db.rankingSubmission.create({
                data: {
                    userId,
                    artistId,
                    rankingState: JSON.stringify({ result, draft }),
                    type,
                    albumId: albumId || null,
                    status: "DRAFT",
                },
            });
        else
            await db.rankingSubmission.update({
                where: {
                    id: existingDraft.id,
                },
                data: {
                    rankingState: JSON.stringify({ result, draft }),
                },
            });

    } catch (error) {
        console.error("Failed to save draft result:", error);
        return { type: "error", message: "Failed to save draft result" };
    }

    revalidatePath(`/sorter/${artistId}/result`);
    return { type: "success", message: "Draft result is successfully saved." };
}
