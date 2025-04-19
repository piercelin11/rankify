"use client";
import React, { useState } from "react";
import RankingLineChart from "./RankingLineChart";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import Tabs from "@/components/menu/Tabs";
import LineChartFilterDropdown, {
	MenuOptionType,
} from "../components/LineChartFilterDropdown";

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
		<div className="space-y-8 sm:space-y-20">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<Tabs
					options={tabOptions}
					color={defaultAlbumData.color}
					activeId={view}
				/>
				<LineChartFilterDropdown
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
