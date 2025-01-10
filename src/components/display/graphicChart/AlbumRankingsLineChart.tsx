"use client";

import { LineChart } from "@/components/chart/LineChart";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import { dateToDashFormat } from "@/lib/utils/helper";
import { useSearchParams } from "next/navigation";
import React from "react";

type AlbumRankingsLineChartProps = {
    defaultData: AlbumStatsType;
    allAlbumsStats: AlbumStatsType[];
};

export default function AlbumRankingsLineChart({
    defaultData,
    allAlbumsStats,
}: AlbumRankingsLineChartProps) {
    const searchParams = useSearchParams();
    const selectedIds = searchParams.getAll("comparison");

    const dates = defaultData.rankings.map((item) => dateToDashFormat(item.date));
    const selectedAlbums = allAlbumsStats.filter((data) =>
        selectedIds.includes(data.id)
    );
    const selectedAlbumsDataset = selectedAlbums.map((album) => {
        const dateIds = defaultData.rankings.map((item) => item.dateId);
        const rankings: (number | null)[] = [];

        for (const dateId of dateIds) {
            const totalPoints = album.rankings.find(
                (ranking) => ranking.dateId === dateId
            )?.totalPoints;
            if (totalPoints) rankings.push(totalPoints);
            else rankings.push(null);
        }

        return {
            name: album.name!,
            color: album.color!,
            datas: rankings,
        };
    });

    return (
        <LineChart
            data={{
                date: dates,
                dataset: [
                    {
                        name: defaultData.name,
                        color: defaultData.color,
                        datas: defaultData.rankings.map((item) => item.totalPoints),
                    },
                    ...selectedAlbumsDataset,
                ],
            }}
            isReverse={false}
        />
    );
}
