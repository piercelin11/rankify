import { prisma } from "@/lib/prisma";

export default async function getAlbumByArtist(artistId: string) {
    const albums = await prisma.album.findMany({
        where: {
            artistId,
        },
        include: {
            artist: true
        }
    });

    return albums;
}
