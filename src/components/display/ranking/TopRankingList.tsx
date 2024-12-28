import React from "react";
import RankingListItem from "./RankingListItem";
import { TrackStatsType } from "@/lib/data/ranking/overall/getTrackStats";
import { TrackHistoryType } from "@/lib/data/ranking/history/getTrackRankingHistory";
import RankingNavButton from "./RankingNavButton";
import NoData from "@/components/general/NoData";

type TopRankingListType = {
	datas: TrackStatsType[] | TrackHistoryType[];
	link: string;
};

export default async function TopRankingList({
	datas,
	link,
}: TopRankingListType) {
	return (
		<div className="space-y-6">
			<h3>Track Rankings</h3>

			{datas.length !== 0 ? (
				<>
					<div>
						{datas.map((track) => (
							<RankingListItem
								data={track}
								key={track.id}
								length={datas.length}
								hasStats={false}
							/>
						))}
					</div>
					<RankingNavButton
						type="forward"
						label="View All Rankings"
						link={link}
					/>
				</>
			) : (
				<NoData />
			)}
		</div>
	);
}
