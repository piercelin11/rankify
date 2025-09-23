import { db } from "@/db/client";

export type CalculateTotalChartRunProps = {
	artistId: string;
	userId: string;
	trackId: string;
};

export default async function calculateTotalChartRun({
	artistId,
	userId,
	trackId,
}: CalculateTotalChartRunProps) {
	let totalChartRun = 0;
	const rankings = await db.trackRanking.findMany({
		where: {
			artistId,
			userId,
			trackId,
			submission: { status: "COMPLETED" },
		},
		select: {
			rankChange: true,
		},
	});

	for (const { rankChange } of rankings) {
        if (rankChange) totalChartRun += Math.abs(rankChange);
	}

    return totalChartRun;
}
