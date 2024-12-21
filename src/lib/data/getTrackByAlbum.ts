import { prisma } from "@/lib/prisma";

export default async function getTrackByAlbum(albumId: string) {
    const tracks = await prisma.track.findMany({
        where: {
            albumId,
        },
        include: {
            artist: true,
            album: true
        }
    });

    return tracks.sort((a, b) => (a.trackNumber - b.trackNumber));
}
