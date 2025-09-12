import { db } from "@/lib/prisma";

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
	const rankings = await db.ranking.findMany({
		where: {
			artistId,
			userId,
			trackId,
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
