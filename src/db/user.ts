import { db } from "@/db/client";
import { UserPreferenceData } from "@/types/data";

export default async function getUserPreference({
	userId,
}: {
	userId: string;
}): Promise<UserPreferenceData | null> {
	const userPreference = (await db.userPreference.findFirst({
		where: {
			userId,
		},
	})) as UserPreferenceData | null;

	return userPreference;
}
