import { AlbumHistoryType } from "@/lib/database/ranking/history/getAlbumsRankingHistory";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import {
	ArrowDownRoundIcon,
	ArrowUpRoundIcon,
} from "@/components/icons/StatsIcons";
import React from "react";
import NoData from "@/components/feedback/NoData";
import Link from "next/link";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";

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

	return <RankingHighlightsCard info={info} type={type} unit="ranking" href={`/artist/${track?.artistId}/track/${track?.id}`} />;
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
					.filter((data) => data.pointsChange != null && data.pointsChange > 0)
					.sort((a, b) => b.pointsChange! - a.pointsChange!)[0];

				return gainer;
			case "loser":
				const loser = data
					.filter((data) => data.pointsChange != null && data.pointsChange < 0)
					.sort((a, b) => a.pointsChange! - b.pointsChange!)[0];
				return loser;
		}
	}

	const album = getInfo();
	const info = album ? { ...album, change: album.pointsChange! } : null;

	return <RankingHighlightsCard info={info} type={type} unit="points" href={`/artist/${album?.artistId}/album/${album?.id}`} />;
}

function RankingHighlightsCard({
	info,
	type,
	unit,
	href,
}: {
	info: { name: string; change: number; img: string | null } | null;
	type: "gainer" | "loser";
	unit: "ranking" | "points";
	href: string,
}) {
	return (
		<>
			{info ? (
				<div
					className="relative flex aspect-square flex-col overflow-hidden rounded-4xl border border-neutral-700 bg-[length:100%] bg-center bg-no-repeat p-4 transition-all duration-500 ease-in-out hover:bg-[length:110%] sm:aspect-video md:aspect-auto 2xl:p-8"
					style={{
						backgroundImage: `linear-gradient(to bottom ,rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0.75) 90%), url("${info.img || "/pic/placeholder.jpg"}")`,
					}}
				>
					<Link href={href} className="ml-auto">
						<button className="rounded-full bg-neutral-900 shadow-dent p-4 hover:bg-neutral-100 hover:text-neutral-950">
							<ArrowTopRightIcon className="h-6 w-6" />
						</button>
					</Link>
					<div className="z-10 mt-auto space-y-3">
						<div className="flex items-start gap-2">
							{type === "gainer" ? (
								<ArrowUpRoundIcon size={35} />
							) : (
								<ArrowDownRoundIcon size={35} />
							)}
							<p className="text-highlight font-numeric font-bold">
								{Math.abs(info.change)}
								<span className="font-sans text-base font-normal">
									{" "}
									{unit === "points" && unit}
								</span>
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-body-big">{info.name}</p>
							<p className="text-neutral-400">
								is the biggest {type} in {unit}.
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="rounded-4xl bg-neutral-900">
					<NoData />
				</div>
			)}
		</>
	);
}
