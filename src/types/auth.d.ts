import { $Enums } from "@prisma/client";
import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    id: string,
    role: $Enums.Role,
    image: string | null,
    name: string;
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}