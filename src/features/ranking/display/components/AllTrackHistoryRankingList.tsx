"use client"

import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { AlbumData } from "@/types/data";
import React from "react";
import { Column } from "./RankingList";
import AchievementDisplay, {
	AchievementType,
} from "../../stats/components/AchievementDisplay";
import TrackRankingList from "./TrackRankingList";
import { dateToLong } from "@/lib/utils/helper";

type TrackRankingListProps = {
	data: TrackHistoryType[];
	albums: AlbumData[];
	title: string;
};

export default function AllTrackHistoryRankingList({
	albums,
	data,
	title,
}: TrackRankingListProps) {
	const columns: Column<TrackHistoryType>[] = [
		{
			key: "peak",
			header: "peak",
		},
		{
			key: "achievement",
			header: "achievement",
			render: (value) => (
				<AchievementDisplay
					achievement={value as AchievementType | undefined}
				/>
			),
		},
	];
	return (
		<TrackRankingList
			columns={columns}
			data={data}
			albums={albums}
			title={title}
		/>
	);
}
