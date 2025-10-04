import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export default {
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
	],
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isAdminRoute = nextUrl.pathname.startsWith("/admin");

			// Admin 路由需要 ADMIN 角色
			if (isAdminRoute) {
				return auth?.user?.role === "ADMIN";
			}

			// 其他路由交給 middleware 處理
			return true;
		},
	},
} satisfies NextAuthConfig;
