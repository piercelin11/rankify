import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { db } from "@/db/client";
import { $Enums } from "@prisma/client";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
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
	...authConfig,
	callbacks: {
		...authConfig.callbacks,
		async session({ session, token, trigger: _trigger }) {
			if (token.sub && session) {
				session.user.id = token.sub;
				session.user.role = token.role as $Enums.Role;
				session.user.image = token.image as string | null;
				session.user.name = token.name as string;
			}

			return session;
		},
		async jwt({ token, trigger: _trigger }) {
			if (!token.sub) return token;
			const existingUser = await db.user.findFirst({
				where: {
					id: token.sub,
				},
			});
			if (!existingUser) return token;

			token.role = existingUser.role;
			token.image = existingUser.image;
			token.name = existingUser.username || existingUser.name;

			return token;
		},
	},
});

export async function getUserSession() {
	const session = await auth();
	if (!session || !session.user) {
		throw new Error(
			"User session is not available. Please ensure the user is authenticated."
		);
	}

	const { id, role, name } = session.user;

	if (!id || !role || !name) {
		throw new Error("User session is missing required attributes.");
	}

	return session.user;
}
