"use client";
import React, { ReactNode, useState } from "react";
import RankingLineChart from "./RankingLineChart";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import Tabs from "@/components/menu/Tabs";

type AlbumRankingLineChart = {
	defaultData: AlbumStatsType;
	allStats: AlbumStatsType[];
	children: ReactNode;
};

export default function AlbumRankingLineChart({
	defaultData,
	allStats,
	children,
}: AlbumRankingLineChart) {
	const [view, setView] = useState("points");
	const menuData = [
		{ label: "Album Points", id: "points", onClick: () => setView("points") },
		{
			label: "Album Rankings",
			id: "rankings",
			onClick: () => setView("rankings"),
		},
	];

	return (
		<div className="space-y-20 p-6">
			<div className="flex items-center justify-between">
				<Tabs menuData={menuData} color={defaultData.color} activeId={view} />
				{children}
			</div>
			{view === "points" ? (
				<RankingLineChart
					defaultData={defaultData}
					allStats={allStats}
					dataKey={"totalPoints"}
					isReverse={false}
				/>
			) : (
				<RankingLineChart
					defaultData={defaultData}
					allStats={allStats}
					dataKey={"ranking"}
					isReverse={true}
				/>
			)}
		</div>
	);
}
