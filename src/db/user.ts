"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/client";
import { UserPreferenceData } from "@/types/data";
import { CACHE_TIMES } from "@/constants/cache";
import { CACHE_TAGS } from "@/constants/cacheTags";

export default async function getUserPreference({
	userId,
}: {
	userId: string;
}): Promise<UserPreferenceData | null> {
	cacheLife(CACHE_TIMES.LONG);
	cacheTag(CACHE_TAGS.USER_DYNAMIC(userId));

	const userPreference = (await db.userPreference.findFirst({
		where: {
			userId,
		},
	})) as UserPreferenceData | null;

	return userPreference;
}
