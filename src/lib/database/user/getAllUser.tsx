import { db } from "@/db/client";

export default async function getAllUsers() {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return users;
}