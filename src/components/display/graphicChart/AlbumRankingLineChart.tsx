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
		<div className="space-y-8 sm:space-y-20">
			<div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
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
