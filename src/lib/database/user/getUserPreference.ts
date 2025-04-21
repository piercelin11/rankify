import { defaultRankingSettings } from "@/features/settings/RankingSettings";
import { db } from "@/lib/prisma";
import { UserPreferenceData } from "@/types/data";
import { $Enums } from "@prisma/client";
import { boolean } from "zod";

type getUserPreferenceProps = {
	userId: string;
};

let userPreference: UserPreferenceData | null = null;

export default async function getUserPreference({
	userId,
}: getUserPreferenceProps): Promise<UserPreferenceData | null> {
	if (!userPreference)
		userPreference = (await db.userPreference.findFirst({
			where: {
				userId,
			},
		})) as UserPreferenceData | null;

	return userPreference;
}

export async function getUserRankingPreference({
	userId,
}: getUserPreferenceProps) {
	if (!userPreference) {
		userPreference = (await db.userPreference.findFirst({
			where: {
				userId,
			},
		})) as UserPreferenceData | null;
	}

	const rankingSettings =
		userPreference?.rankingSettings || defaultRankingSettings;

	const conditions = {
		NOT: {
			OR: [
				rankingSettings.includeInterlude && { name: { contains: "interlude" } },
				rankingSettings.includeIntroOutro && { name: { contains: "intro" } },
				rankingSettings.includeIntroOutro && { name: { contains: "outro" } },
			].filter((item) => typeof item !== "boolean"),
			type: rankingSettings.includeReissueTrack
				? {
						equals: "REISSUE" as $Enums.TrackType,
					}
				: undefined,
		},
	};

	return conditions;
}
