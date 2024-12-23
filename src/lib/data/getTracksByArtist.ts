import { prisma } from "@/lib/prisma";

export default async function getTracksByArtist(artistId: string) {
    const tracks = await prisma.track.findMany({
        where: {
            artistId,
        },
        include: {
            artist: true,
            album: true
        }
    });

    return tracks;
}
