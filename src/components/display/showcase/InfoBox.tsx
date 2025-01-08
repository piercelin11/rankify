import { AlbumHistoryType } from "@/lib/database/ranking/history/getAlbumsRankingHistory";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import {
	ArrowDownRoundIcon,
	ArrowUpRoundIcon,
} from "@/components/icon/StatsIcons";
import { ArrowUpIcon, TriangleUpIcon } from "@radix-ui/react-icons";
import React, { ReactNode } from "react";
import NoData from "@/components/general/NoData";

type TrackInfoBoxProps = {
	type: "gainer" | "loser";
	datas: TrackHistoryType[];
};

export function TrackInfoBox({ type, datas }: TrackInfoBoxProps) {
	function getInfo() {
		switch (type) {
			case "gainer":
				const gainer = datas
					.filter((data) => data.rankChange !== null && data.rankChange > 0)
					.sort((a, b) => b.rankChange! - a.rankChange!)[0];
				return gainer;
			case "loser":
				const loser = datas
					.filter((data) => data.rankChange !== null && data.rankChange < 0)
					.sort((a, b) => a.rankChange! - b.rankChange!)[0];
				return loser;
		}
	}

	const data = getInfo();
	const info = { ...data, change: data.rankChange! };

	return <InfoBox info={info} type={type} unit="ranking" />;
}

type AlbumInfoBoxProps = {
	type: "gainer" | "loser";
	datas: AlbumHistoryType[];
};

export function AlbumInfoBox({ type, datas }: AlbumInfoBoxProps) {
	function getInfo() {
		if (datas.filter((data) => data.pointsChange !== null).length === 0)
			return null;
		switch (type) {
			case "gainer":
				const gainer = datas
					.filter((data) => data.pointsChange !== null && data.pointsChange > 0)
					.sort((a, b) => b.pointsChange! - a.pointsChange!)[0];
				return gainer;
			case "loser":
				const loser = datas
					.filter((data) => data.pointsChange !== null && data.pointsChange < 0)
					.sort((a, b) => a.pointsChange! - b.pointsChange!)[0];
				return loser;
		}
	}

	const data = getInfo();
	const info = data ? { ...data, change: data.pointsChange! } : null;

	return <InfoBox info={info} type={type} unit="points" />;
}

function InfoBox({
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
					className="flex items-end rounded-xl bg-[length:100%] bg-center bg-no-repeat p-4 transition-all duration-500 ease-in-out hover:bg-[length:110%] 2xl:p-8"
					style={{
						backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)), url("${info.img || "/pic/placeholder.jpg"}")`,
					}}
				>
					<div className="space-y-3">
						<div className="flex items-end gap-1">
							{type === "gainer" ? (
								<ArrowUpRoundIcon size={45} />
							) : (
								<ArrowDownRoundIcon size={45} />
							)}
							<p className="font-numeric text-4xl font-extrabold">
								{Math.abs(info.change)}
								<span className="font-sans text-base font-normal">
									{" "}
									{unit === "points" && unit}
								</span>
							</p>
						</div>
						<div>
							<p className="text-xl font-bold">{info.name}</p>
							<p>
								is the biggest {type} in {unit}.
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="bg-zinc-900">
					<NoData />
				</div>
			)}
		</>
	);
}
