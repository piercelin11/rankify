import { cache } from "react";
import { db } from "@/db/client";
import { DateRange } from "@/types/general";
import { AlbumStatsType } from "@/types/album";

type getAlbumsStatsProps = {
    artistId: string;
    userId: string;
    dateRange?: DateRange;
};

function getAlbumPercentileCounts(
    albumIds: string[],
    allTrackStats: {
        track: { albumId: string | null };
        overallRank: number;
    }[],
    totalTrackCount: number
) {
    if (totalTrackCount === 0) {
        return {} as Record<string, { top5: number; top10: number; top25: number; top50: number }>;
    }
    
    const statsByAlbum = allTrackStats.reduce((acc, stat) => {
        if (stat.track.albumId) {
            if (!acc[stat.track.albumId]) {
                acc[stat.track.albumId] = [];
            }
            acc[stat.track.albumId].push(stat);
        }
        return acc;
    }, {} as Record<string, typeof allTrackStats>);

    return albumIds.reduce((acc, albumId) => {
        const counts = { top5: 0, top10: 0, top25: 0, top50: 0 };

        (statsByAlbum[albumId] || []).forEach(track => {
            const percentile = track.overallRank / totalTrackCount;
            if (percentile <= 0.05) counts.top5++;
            if (percentile <= 0.1) counts.top10++;
            if (percentile <= 0.25) counts.top25++;
            if (percentile <= 0.5) counts.top50++;
        });

        acc[albumId] = counts;
        return acc;
    }, {} as Record<string, { top5: number; top10: number; top25: number; top50: number }>);
}
 
const getAlbumsStats = cache(async ({
    artistId,
    userId,
}: getAlbumsStatsProps): Promise<AlbumStatsType[]> => {
    const allTrackStatsForArtist = await db.trackStats.findMany({
        where: { artistId, userId },
        select: {
            track: { select: { albumId: true } },
            overallRank: true,
        },
    });
    
    const totalTrackCount = allTrackStatsForArtist.length;

    const relevantAlbumIds = [
        ...new Set(allTrackStatsForArtist.map(t => t.track.albumId).filter(Boolean) as string[]),
    ];

    const [albumData, albumPoints] = await Promise.all([
        
        db.album.findMany({
            where: {
                id: { in: relevantAlbumIds },
            },
        }),

        db.albumRanking.groupBy({
            by: ["albumId"],
            where: {
                artistId,
                userId,
                albumId: { in: relevantAlbumIds },
                submission: { type: "ARTIST", status: "COMPLETED" },
            },
            _avg: { points: true, basePoints: true, rank: true },
            _count: { rank: true },
        }),
    ]);
    
    const albumDataMap = new Map(albumData.map((album) => [album.id, album]));

    const percentileCounts = getAlbumPercentileCounts(relevantAlbumIds, allTrackStatsForArtist, totalTrackCount);

    const result = albumPoints
        .map((data) => {
            const album = albumDataMap.get(data.albumId);
            if (!album) return null; 

            const counts = percentileCounts[data.albumId] || { top5: 0, top10: 0, top25: 0, top50: 0 };

            return {
                ...album,
                averageRank: data._avg.rank?.toFixed(1) ?? "0",
                top5PercentCount: counts.top5,
                top10PercentCount: counts.top10,
                top25PercentCount: counts.top25,
                top50PercentCount: counts.top50,
                avgPoints: data._avg.points ? Math.round(data._avg.points) : 0,
                avgBasePoints: data._avg.basePoints ? Math.round(data._avg.basePoints) : 0,
                submissionCount: data._count.rank,
            };
        })
        .filter(Boolean) as (AlbumStatsType & { avgPoints: number })[];
        
    return result
        .sort((a, b) => b.avgPoints - a.avgPoints)
        .map((data, index) => ({
            ...data,
            rank: index + 1,
        }));
});

export default getAlbumsStats;