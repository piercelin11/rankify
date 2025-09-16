import { db } from "@/db/client";

type getLoggedArtistsProps = {
    userId: string;
};

export default async function getUnloggedArtists({
    userId,
}: getLoggedArtistsProps) {

    const artists = await db.artist.findMany({
        where: {
            tracks: {
                none: {
                    rankings: {
                        some: {
                            userId
                        }
                    }
                }
            }
        },
    });

    return artists;
}
