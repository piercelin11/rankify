import authConfig from "../auth.config";
import NextAuth from "next-auth";
import {
	privateRoutes,
	authRoutes,
	apiAuthPrefix,
	DEFAULT_LOGIN_REDIRECT,
} from "./config/route";
import { NextResponse } from "next/server";
import { match } from "path-to-regexp";

const { auth } = NextAuth(authConfig);

/**
 * 檢查路徑是否匹配私密路由
 * @param pathname - 要檢查的路徑
 * @returns 是否為私密路由
 */
function isPrivateRoute(pathname: string): boolean {
	return privateRoutes.some((route) => {
		const matcher = match(route, { decode: decodeURIComponent });
		return matcher(pathname) !== false;
	});
}

export default auth(async function proxy(req) {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);
	const isPrivate = isPrivateRoute(nextUrl.pathname);

	// 1. API Auth 路由:直接放行
	if (isApiAuthRoute) {
		return;
	}

	// 2. 驗證路由:已登入則重導向至首頁
	if (isAuthRoute) {
		if (isLoggedIn) {
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl.origin));
		}
		return;
	}

	// 3. 私密路由:未登入則重導向至登入頁
	if (isPrivate && !isLoggedIn) {
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
