import authConfig from "../auth.config";
import NextAuth from "next-auth";
import {
	publicRoutes,
	authRoutes,
	apiAuthPrefix,
	DEFAULT_LOGIN_REDIRECT
} from "./config/route";

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

	return;
});

//設置啟用 Middleware 的路徑
export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
