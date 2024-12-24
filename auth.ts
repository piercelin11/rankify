import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { db } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(db),
	session: { strategy: "jwt" },
	events: {
		async linkAccount({ user }) {
			await db.user.update({
				where: {
					id: user.id,
				},
				data: {
					emailVerified: new Date(),
				},
			});
		},
	},
	callbacks: {
		async session({ session, token }) {
			if (token.sub && session) {
				session.user.id = token.sub;
				session.user.role = token.role as $Enums.Role;
			}

			return session;
		},
		async jwt({ token }) {
			if (!token.sub) return token;
			const existingUser = 
				await db.user.findFirst({
					where: {
						id: token.sub,
					},
				})
			;

			if (!existingUser) return token;

			token.role = existingUser.role;

			return token;
		},
	},
	...authConfig,
});
