"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { revalidatePath } from "next/cache";

export default async function deleteSubmission({
	submissionId,
}: {
	submissionId: string;
}) {
	const { id: userId } = await getUserSession();

	try {
		await db.rankingSubmission.delete({
			where: {
				id: submissionId,
				userId,
			},
		});
	} catch (error) {
		console.error("Failed to delete draft:", error);
		return { type: "error", message: "Failed to delete draft" };
	}

	revalidatePath("/sorter");
	return { type: "success", message: "Draft is successfully deleted." };
}
