"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/../auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/route";
import { AppResponseType } from "@/types/response";

export default async function handleOath(provider: "google"): Promise<AppResponseType> {
	try {
		await signIn(provider, { redirectTo: DEFAULT_LOGIN_REDIRECT });
		return { type: "success", message: "successfully sign in." };
	} catch (error) {
		if (error instanceof AuthError && "type" in error) {
			switch (error.type) {
				case "OAuthSignInError":
					return { type: "error", message: "OAuth sign in error." };
				default:
					return { type: "error", message: "Something went wrong." };
			}
		}

		console.error("handleOath error:", error);
		return { type: "error", message: "Authentication failed" };
	}
}