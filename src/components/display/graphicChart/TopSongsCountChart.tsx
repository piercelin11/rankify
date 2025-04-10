"use client";

import PolarAreaChart from "@/components/chartjs/PolarAreaChart";
import { cn } from "@/lib/cn";
import { AlbumHistoryType } from "@/lib/database/ranking/history/getAlbumsRankingHistory";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import React, { useState } from "react";

type TopSongsCountChartProps = {
	data: AlbumStatsType[] | AlbumHistoryType[];
};

export default function TopSongsCountChart({ data }: TopSongsCountChartProps) {
	const [view, setView] = useState<"25" | "50">("50");

	const tabData = [
		{
			name: "25",
			onClick: () => setView("25"),
		},
		{
			name: "50",
			onClick: () => setView("50"),
		},
	];

	const mainDataKey = view === "50" ? "top50PercentCount" : "top25PercentCount";

	return (
		<div className="space-y-6 rounded-xl bg-zinc-900 px-8 py-6">
			<div className="flex justify-end">
				<div className="flex cursor-pointer select-none rounded-lg border border-zinc-800">
					{tabData.map((data) => (
						<div
							className={cn(
								"justify-self-center rounded-lg px-6 py-3 text-zinc-600",
								{
									"bg-lime-500 text-zinc-950": view === data.name,
								}
							)}
							key={data.name}
							onClick={data.onClick}
						>
							Songs in top {data.name}%
						</div>
					))}
				</div>
			</div>
			<div className="2xl:py-18 py-14">
				<PolarAreaChart
					data={{
						labels: data.map((ranking) => ranking.name),
						mainData: data.map((ranking) => ranking[mainDataKey]),
						color: data.map((ranking) => ranking.color),
					}}
				/>
			</div>
		</div>
	);
}
