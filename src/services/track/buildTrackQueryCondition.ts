import { Prisma } from "@prisma/client";

interface RankingSettings {
	includeInterlude: boolean;
	includeIntroOutro: boolean;
	includeReissueTrack: boolean;
}

export function buildTrackQueryCondition(
	rankingSettings: RankingSettings
): Prisma.TrackWhereInput {
	const excludeConditions: Prisma.TrackWhereInput[] = [];

	if (!rankingSettings.includeInterlude) {
		excludeConditions.push({
			name: { contains: "interlude", mode: "insensitive" },
		});
	}

	if (!rankingSettings.includeIntroOutro) {
		excludeConditions.push(
			{ name: { contains: "intro", mode: "insensitive" } },
			{ name: { contains: "outro", mode: "insensitive" } }
		);
	}

	if (!rankingSettings.includeReissueTrack) {
		excludeConditions.push({ type: "REISSUE" });
	}

	if (excludeConditions.length === 0) {
		return {};
	}

	return {
		NOT: {
			OR: excludeConditions,
		},
	};
}
