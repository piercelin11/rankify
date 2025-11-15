"use server";

import { signIn } from "@/../auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/route";
import { AppResponseType } from "@/types/response";

export default async function handleOath(
	provider: "google"
): Promise<AppResponseType> {
	await signIn(provider, { redirectTo: DEFAULT_LOGIN_REDIRECT });
	return { type: "success", message: "successfully sign in." };
}
