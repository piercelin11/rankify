"use server"; 

import { redirect } from "next/navigation";
import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";

export default async function saveDraft(
	artistId: string,
	draft: string
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
					draft,
				},
			});
		else
			await db.rankingDraft.update({
				where: {
					id: existingDraft.id,
				},
				data: {
					draft,
				},
			});

		isSuccess = true;
	} catch (error) {
		console.error("Failed to save draft:", error);
		return { success: false, message: "Failed to save draft" };
	}

	return { success: true, message: "Draft is successfully saved." };
}
