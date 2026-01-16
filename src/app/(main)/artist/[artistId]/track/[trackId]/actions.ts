"use server";

import { getTracksRankings } from "@/db/track";
import { requireSession } from "@/../auth";

export async function getComparisonTracksData(trackIds: string[]) {
	const { id: userId } = await requireSession();

	if (!userId || trackIds.length === 0) {
		return [];
	}

	try {
		const tracks = await getTracksRankings({ userId, trackIds });
		return tracks.map(track => ({
			...track,
			type: 'track' as const,
		}));
	} catch (error) {
		console.error("Failed to fetch comparison tracks:", error);
		return [];
	}
}