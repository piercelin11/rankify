"use client";
import React, { useState } from "react";
import RankingLineChart from "./RankingLineChart";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import Tabs from "@/components/navigation/Tabs";
import LineChartFilter, {
	MenuOptionType,
} from "../components/LineChartFilter";

type AlbumRankingLineChart = {
	defaultAlbumData: AlbumStatsType;
	allAlbumData: AlbumStatsType[];
	menuOptions: MenuOptionType[];
};

export default function AlbumRankingLineChart({
	defaultAlbumData,
	allAlbumData,
	menuOptions,
}: AlbumRankingLineChart) {
	const [view, setView] = useState("points");
	const tabOptions = [
		{ label: "Album Points", id: "points", onClick: () => setView("points") },
		{
			label: "Album Rankings",
			id: "rankings",
			onClick: () => setView("rankings"),
		},
	];

	return (
		<div className="stats-card bg-glow space-y-8">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<Tabs
					options={tabOptions}
					color={defaultAlbumData.color}
					activeId={view}
				/>
				<LineChartFilter
					defaultTag={defaultAlbumData}
					menuOptions={menuOptions}
				/>
			</div>
			{view === "points" ? (
				<RankingLineChart
					defaultData={defaultAlbumData}
					allRankings={allAlbumData}
					dataKey={"totalPoints"}
					isReverse={false}
				/>
			) : (
				<RankingLineChart
					defaultData={defaultAlbumData}
					allRankings={allAlbumData}
					dataKey={"ranking"}
					isReverse={true}
				/>
			)}
		</div>
	);
}
