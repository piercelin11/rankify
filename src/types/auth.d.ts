import { $Enums } from "@prisma/client";
import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    role: $Enums.Role
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}