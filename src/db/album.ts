import { db } from "@/db/client";
import { DateRange } from "@/types/general";

export async function getLoggedAlbumNames(
    artistId: string,
    userId: string,
    dateRange?: DateRange,
) {
    const dateFilter = dateRange ? {
		date: {
			...(dateRange.from && { gte: dateRange.from }),
			...(dateRange.to && { lte: dateRange.to }),
		}
	} : undefined;

    const albums = await db.album.findMany({
        where: {
            artistId,
            tracks: {
                some: {
                    rankings: {
                        some: {
                            userId,
                            date: dateFilter,
                        },
                    },
                },
            },
        },
        select: {
            name: true,
        },
        orderBy: {
            releaseDate: "desc",
        },
    });

    return albums;
}
