import { db } from "@/lib/prisma";

export default async function getTrackById(trackId: string) {
    const album = await db.track.findFirst({
        where: {
            id: trackId,
        },
        include: {
            artist: true,
            album: true,
        }
    });

    return album;
}
