"use server";

import { db } from "@/db/client";
import { AppResponseType } from "@/types/response";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/../auth";

type UpdateUserProps = {
    userId: string;
    role: Role;
};

export default async function updateUser({
    userId,
    role,
}: UpdateUserProps): Promise<AppResponseType> {
    try {
        await requireAdmin();

        await db.user.update({
            where: {
                id: userId,
            },
            data: {
                role,
            },
        });

        revalidatePath("/admin/user");

        return {
            type: "success",
            message: "使用者角色更新成功"
        };
    } catch (error) {
        console.error("updateUser error:", error);
        return {
            type: "error",
            message: "更新使用者角色失敗"
        };
    }
}