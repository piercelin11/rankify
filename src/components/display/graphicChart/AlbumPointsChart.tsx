import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NoData from "@/components/general/NoData";
import { AlbumHistoryType } from "@/lib/data/ranking/history/getAlbumsRankingHistory";
import { AlbumStatsType } from "@/lib/data/ranking/overview/getAlbumsStats";
import React, { ReactNode } from "react";

type OverviewAlbumPointsProps = {
	datas: AlbumStatsType[];
};

type HostoryAlbumPointsProps = {
	datas: AlbumHistoryType[];
};

export function OverviewAlbumPointsChart({ datas }: OverviewAlbumPointsProps) {
	return (
		<AlbumPointsChartLayout>
			{datas.length !== 0 ? (
				<DoubleBarChart
					data={{
						labels: datas.map((album) => album.name),
						mainData: datas.map((album) => album.totalPoints),
						subData: datas.map((album) => album.rawTotalPoints),
						color: datas.map((album) => album.color),
					}}
					datasetLabels={{
						mainDataLabel: "points",
						subDataLabel: "raw points",
					}}
				/>
			) : (
				<NoData />
			)}
		</AlbumPointsChartLayout>
	);
}

export function HistoryAlbumPointsChart({ datas }: HostoryAlbumPointsProps) {
	return (
		<AlbumPointsChartLayout>
			{datas.length !== 0 ? (
				<DoubleBarChart
					data={{
						labels: datas.map((album) => album.name),
						mainData: datas.map((album) => album.totalPoints),
						subData: datas.map((album) => album.previousTotalPoints),
						color: datas.map((album) => album.color),
					}}
					datasetLabels={{
						mainDataLabel: "points",
						subDataLabel: "previous points",
					}}
				/>
			) : (
				<NoData />
			)}
		</AlbumPointsChartLayout>
	);
}

function AlbumPointsChartLayout({ children }: { children: ReactNode }) {
	return (
		<div className="space-y-6">
			<h3>Album Points</h3>
			<div className="p-5">{children}</div>
		</div>
	);
}
