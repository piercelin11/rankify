"use client";

import PolarAreaChart from "@/components/chart/PolarAreaChart";
import { cn } from "@/lib/cn";
import { AlbumHistoryType } from "@/lib/data/ranking/history/getAlbumRankingHistory";
import { AlbumStatsType } from "@/lib/data/ranking/overall/getAlbumStats";
import React, { useState } from "react";

type TopSongsCountChartProps = {
	datas: AlbumStatsType[] | AlbumHistoryType[];
};

export default function TopSongsCountChart({ datas }: TopSongsCountChartProps) {
	const [view, setView] = useState<"25" | "50">("50");

	const tabData = [
		{
			name: "25",
            onClick: () => setView("25")
		},
		{
			name: "50",
            onClick: () => setView("50")
		},
	];
    
    const mainDataKey = view === "50" ? "top25PercentCount" : "top50PercentCount"

	return (
		<div className="space-y-6 rounded-xl bg-zinc-900 px-8 py-6">
			<div className="flex justify-end">
				<div className="flex select-none rounded-lg border border-zinc-800">
					{tabData.map((data) => (
						<div
							className={cn(
								"justify-self-center rounded-lg text-sm px-6 py-2 text-zinc-600",
								{
									"bg-lime-500 text-zinc-950": view === data.name,
								}
							)}
                            key={data.name}
                            onClick={data.onClick}
						>
							Top {data.name}
						</div>
					))}
				</div>
			</div>
			<div className="py-4">
				<PolarAreaChart
					data={{
						labels: datas.map((ranking) => ranking.name),
						mainData: datas.map((ranking) => ranking[mainDataKey]),
						color: datas.map((ranking) => ranking.color),
					}}
				/>
			</div>
		</div>
	);
}
