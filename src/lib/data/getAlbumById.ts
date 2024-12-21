import { prisma } from "@/lib/prisma";

export default async function getAlbumById(albumId: string) {
    const album = await prisma.album.findFirst({
        where: {
            id: albumId,
        },
    });

    return album;
}
