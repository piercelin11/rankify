import { cache } from "react";
import { db } from "@/db/client";
import { DateRange } from "@/types/general";
import { AlbumStatsType } from "@/types/album";

type getAlbumsStatsProps = {
    artistId: string;
    userId: string;
    dateRange?: DateRange;
};

const getAlbumsStats = cache(
    async ({
        artistId,
        userId,
    }: getAlbumsStatsProps): Promise<AlbumStatsType[]> => {
        // 直接查詢 AlbumStats（已預先計算好所有資料）
        const albumStats = await db.albumStat.findMany({
            where: { artistId, userId },
            include: {
                album: {
                    select: {
                        id: true,
                        name: true,
                        artistId: true,
                        spotifyUrl: true,
                        color: true,
                        img: true,
                        releaseDate: true,
                        type: true,
                    },
                },
            },
            orderBy: { overallRank: "asc" },
        });

        // 轉換成 AlbumStatsType 格式
        return albumStats.map((stat) => ({
            // Album Model 欄位
            id: stat.album.id,
            name: stat.album.name,
            artistId: stat.album.artistId,
            spotifyUrl: stat.album.spotifyUrl,
            color: stat.album.color,
            img: stat.album.img,
            releaseDate: stat.album.releaseDate,
            type: stat.album.type,

            // AlbumStats 欄位
            rank: stat.overallRank,
            averageRank: stat.averageTrackRank.toFixed(1),
            avgPoints: stat.points,
            submissionCount: stat.submissionCount,

            // 百分位統計（已預先計算）
            top5PercentCount: stat.top5PercentCount,
            top10PercentCount: stat.top10PercentCount,
            top25PercentCount: stat.top25PercentCount,
            top50PercentCount: stat.top50PercentCount,
        }));
    }
);

export default getAlbumsStats;
