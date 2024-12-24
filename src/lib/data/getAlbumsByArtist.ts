import { db } from "@/lib/prisma";

export default async function getAlbumsByArtist(artistId: string) {
    const albums = await db.album.findMany({
        where: {
            artistId,
        },
        include: {
            artist: true
        },
        orderBy: {
            releaseDate: "desc"
        }
    });

    return albums;
}
