"use client";

import PolarAreaChart from "@/components/charts/PolarAreaChart";
import DropdownMenu from "@/components/menu/DropdownMenu";
import Tabs from "@/components/menu/Tabs";
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
			label: "Songs in top 25%",
			id: "25",
			onClick: () => setView("25"),
		},
		{
			label: "Songs in top 50%",
			id: "50",
			onClick: () => setView("50"),
		},
	];

	const mainDataKey = view === "50" ? "top50PercentCount" : "top25PercentCount";

	return (
		<div className="rounded-xl bg-zinc-900 p-3 xl:p-6">
			<div className="md:hidden">
				<DropdownMenu menuData={tabData} variant="dark" defaultValue="Songs in top 50%" />
			</div>
			<div className="hidden md:block">
				<Tabs options={tabData} activeId={view} />
			</div>
			<div className="2xl:py-18 mt-6 py-14">
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
