import { db } from "@/lib/prisma";

export default async function getAlbumById(albumId: string) {
    const album = await db.album.findFirst({
        where: {
            id: albumId,
        },
    });

    return album;
}
