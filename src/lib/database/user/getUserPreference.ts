import { defaultRankingSettings } from "@/features/settings/components/RankingSettingsForm";
import { db } from "@/lib/prisma";
import { UserPreferenceData } from "@/types/data.types";
import { $Enums } from "@prisma/client";

type getUserPreferenceProps = {
	userId: string;
};

export default async function getUserPreference({
	userId,
}: getUserPreferenceProps): Promise<UserPreferenceData | null> {
	const userPreference = (await db.userPreference.findFirst({
		where: {
			userId,
		},
	})) as UserPreferenceData | null;

	return userPreference;
}

export async function getUserRankingPreference({
	userId,
}: getUserPreferenceProps) {
	const userPreference = (await db.userPreference.findFirst({
		where: {
			userId,
		},
	})) as UserPreferenceData | null;

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
