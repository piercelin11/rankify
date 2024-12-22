import { prisma } from "@/lib/prisma";

export default async function getSinglesByArtist(artistId: string) {
    const singles = await prisma.track.findMany({
        where: {
            artistId,
            albumId: null
        },
        include: {
            artist: true
        }
    });

    return singles;
}
