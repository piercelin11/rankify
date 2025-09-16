import { db } from "@/db/client";

type getUserByIdProps = {
    userId: string;
};

export default async function getUserById({
    userId,
}: getUserByIdProps) {

    const user = await db.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
        }
    });

    return user;
}
