"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function deleteRankingDraft(
	artistId: string,
	redirectPath?: string
) {
	const { id: userId } = await getUserSession();
	let isSuccess = false;

	try {
		await db.rankingDraft.deleteMany({
			where: {
				artistId,
				userId,
			},
		});

		isSuccess = true;
	} catch (error) {
		console.error("Failed to delete draft:", error);
		return { success: false, message: "Failed to delete draft" };
	}

	if (redirectPath) redirect(redirectPath);
	return { success: true, message: "Draft is successfully deleted." };
}
