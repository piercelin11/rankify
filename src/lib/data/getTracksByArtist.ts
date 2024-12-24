import { db } from "@/lib/prisma";

export default async function getTracksByArtist(artistId: string) {
    const tracks = await db.track.findMany({
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
