import { db } from "@/lib/prisma";
import { UserPreferenceData } from "@/types/data";

type getUserPreferenceProps = {
	userId: string;
};

export default async function getUserPreference({
	userId,
}: getUserPreferenceProps): Promise<UserPreferenceData | null> {
	const userPreference = await db.userPreference.findFirst({
		where: {
			userId,
		},
	});

	return userPreference as (UserPreferenceData | null);
}
