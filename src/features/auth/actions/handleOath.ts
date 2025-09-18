"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/../auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/config/route"

export default async function handleOath(provider: "google") {

    try {
        await signIn(provider, {redirectTo: DEFAULT_LOGIN_REDIRECT})
        return {success: "successfully sign in."}
    } catch (error) {
        if (error instanceof AuthError && "type" in error) {
			switch (error.type) {
				case "OAuthSignInError":
					return {error: "OAuth sign in error."}
				default:
				return {error: "Something went wrong."}
			}
		}

		throw error
    }

}