import { AlbumHistoryType } from "@/lib/database/ranking/history/getAlbumsRankingHistory";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import {
	ArrowDownRoundIcon,
	ArrowUpRoundIcon,
} from "@/components/icons/StatsIcons";
import React from "react";
import NoData from "@/components/feedback/NoData";

type TrackHighlightsCardProps = {
	type: "gainer" | "loser";
	data: TrackHistoryType[];
};

export function TrackHighlightsCard({ type, data }: TrackHighlightsCardProps) {
	function getInfo() {
		switch (type) {
			case "gainer":
				const gainer = data
					.filter((data) => data.rankChange !== null && data.rankChange > 0)
					.sort((a, b) => b.rankChange! - a.rankChange!)[0];
				return gainer;
			case "loser":
				const loser = data
					.filter((data) => data.rankChange !== null && data.rankChange < 0)
					.sort((a, b) => a.rankChange! - b.rankChange!)[0];
				return loser;
		}
	}

	const track = getInfo();
	const info = { ...track, change: track.rankChange! };

	return <RankingHighlightsCard info={info} type={type} unit="ranking" />;
}

type AlbumHighlightsCardProps = {
	type: "gainer" | "loser";
	data: AlbumHistoryType[];
};

export function AlbumHighlightsCard({ type, data }: AlbumHighlightsCardProps) {
	function getInfo() {
		if (data.filter((data) => data.pointsChange !== null).length === 0)
			return null;
		switch (type) {
			case "gainer":
				const gainer = data
					.filter((data) => data.pointsChange !== null && data.pointsChange > 0)
					.sort((a, b) => b.pointsChange! - a.pointsChange!)[0];

				return gainer;
			case "loser":
				const loser = data
					.filter((data) => data.pointsChange !== null && data.pointsChange < 0)
					.sort((a, b) => a.pointsChange! - b.pointsChange!)[0];
				return loser;
		}
	}

	const album = getInfo();
	const info = album ? { ...album, change: album.pointsChange! } : null;

	return <RankingHighlightsCard info={info} type={type} unit="points" />;
}

function RankingHighlightsCard({
	info,
	type,
	unit,
}: {
	info: { name: string; change: number; img: string | null } | null;
	type: "gainer" | "loser";
	unit: "ranking" | "points";
}) {
	return (
		<>
			{info ? (
				<div
					className="flex aspect-square rounded-xl border border-neutral-700 bg-[length:100%] bg-center bg-no-repeat p-4 transition-all duration-500 ease-in-out hover:bg-[length:110%] sm:aspect-video md:aspect-auto 2xl:p-8"
					style={{
						backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)), url("${info.img || "/pic/placeholder.jpg"}")`,
					}}
				>
					<div className="mt-auto space-y-3">
						<div className="flex items-end gap-1">
							{type === "gainer" ? (
								<ArrowUpRoundIcon size={45} />
							) : (
								<ArrowDownRoundIcon size={45} />
							)}
							<p className="text-highlight font-numeric">
								{Math.abs(info.change)}
								<span className="font-sans text-base font-normal">
									{" "}
									{unit === "points" && unit}
								</span>
							</p>
						</div>
						<div>
							<p className="text-body-big">{info.name}</p>
							<p>
								is the biggest {type} in {unit}.
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="bg-neutral-900">
					<NoData />
				</div>
			)}
		</>
	);
}
