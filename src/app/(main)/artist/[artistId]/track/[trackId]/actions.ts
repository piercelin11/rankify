"use server";

import { getTracksRankings } from "@/db/track";
import { getUserSession } from "@/../auth";

export async function getComparisonTracksData(trackIds: string[]) {
	const { id: userId } = await getUserSession();

	if (!userId || trackIds.length === 0) {
		return [];
	}

	try {
		const tracks = await getTracksRankings(userId, trackIds);
		return tracks;
	} catch (error) {
		console.error("Failed to fetch comparison tracks:", error);
		return [];
	}
}