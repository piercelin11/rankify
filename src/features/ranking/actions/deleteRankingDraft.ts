"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { redirect } from "next/navigation";
import { $Enums } from "@prisma/client";

export default async function deleteRankingDraft(
	artistId: string,
	type?: $Enums.RankingType,
	albumId?: string,
	redirectPath?: string
) {
	const { id: userId } = await getUserSession();

	const whereClause: any = {
		artistId,
		userId,
	};

	// 如果提供了 type，加入精確匹配
	if (type !== undefined) {
		whereClause.type = type;
		whereClause.albumId = albumId || null;
	}

	try {
		await db.rankingDraft.deleteMany({
			where: whereClause,
		});
	} catch (error) {
		console.error("Failed to delete draft:", error);
		return { type: "error", message: "Failed to delete draft" };
	}

	if (redirectPath) redirect(redirectPath);
	return { type: "success", message: "Draft is successfully deleted." };
}
