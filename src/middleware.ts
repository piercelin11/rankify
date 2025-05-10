import authConfig from "../auth.config";
import NextAuth from "next-auth";
import {
	publicRoutes,
	authRoutes,
	apiAuthPrefix,
	DEFAULT_LOGIN_REDIRECT,
} from "./config/route.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return;
	}

	if (isAuthRoute) {
		if (isLoggedIn)
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl.origin));
		return;
	}

	if (!isLoggedIn && !isPublicRoute) {
		return Response.redirect(new URL("/auth/signin", nextUrl.origin));
	}

	// --- 判斷是否為 Server Action 請求 ---
	const isServerAction = req.headers.get("Next-Action") !== null;

	if (isServerAction) {
		return NextResponse.next();
	} else {
		const requestHeaders = new Headers(req.headers);
		requestHeaders.set("x-current-path", nextUrl.pathname);

		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	}
});

//設置啟用 Middleware 的路徑
export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
