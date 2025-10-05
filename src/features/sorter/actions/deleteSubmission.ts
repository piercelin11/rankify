"use server";

import { getUserSession } from "@/../auth";
import { db } from "@/db/client";
import { revalidatePath } from "next/cache";

export default async function deleteSubmission({
	submissionId,
}: {
	submissionId: string;
}) {
	try {
		const { id: userId } = await getUserSession();

		await db.rankingSubmission.delete({
			where: {
				id: submissionId,
				userId,
			},
		});

		revalidatePath("/sorter");
		return { type: "success", message: "Draft is successfully deleted." };
	} catch (error) {
		console.error("deleteSubmission error:", error);
		return { type: "error", message: "Failed to delete draft" };
	}
}
