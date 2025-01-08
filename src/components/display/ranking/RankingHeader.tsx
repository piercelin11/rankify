"use client";
import React from "react";
import { RankingListGridLayout } from "./RankingListItem";
import { hasRankChange } from "./RankingListItem";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";
import { useSearchParams } from "next/navigation";

const headerItem = [
	{ label: "peak", sortBy: "peak" },
	{ label: "gap", sortBy: "gap" },
	{ label: "chartrun", sortBy: "totalChartRun" },
	{ label: "top 10s", sortBy: "top10Count" },
] as const;

export type HeaderSortByType = (typeof headerItem)[number]["sortBy"];

type RankingListHeaderProps = {
	data: TrackStatsType | TrackHistoryType;
	hasStats: boolean;
};

export default function RankingHeader({
	data,
	hasStats,
}: RankingListHeaderProps) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort") as HeaderSortByType | null;
	const orderQuery = searchParams.get("order") as "asc" | "desc" | null;

	function handleClick(sortBy: HeaderSortByType) {
		const params = new URLSearchParams(searchParams); 

		if (sortBy !== sortQuery) {
			params.set("sort", sortBy);
			params.set("order", "asc");
		} else {
			if (orderQuery === "asc") {
				params.set("order", "desc");
			} else {
				params.delete("sort");
				params.delete("order");
			}
		}

		window.history.replaceState(null, "", `?${params.toString()}`);
	}

	function SortButton(sortBy: HeaderSortByType) {
		return (
			<div
				className={cn("flex items-center gap-1", {
					"text-zinc-100": sortBy === sortQuery,
				})}
				onClick={() => {
					if (handleClick) handleClick(sortBy);
				}}
			>
				{sortBy !== sortQuery ? (
					<CaretSortIcon />
				) : orderQuery === "asc" ? (
					<ArrowUpIcon />
				) : (
					<ArrowDownIcon />
				)}
				<p>{headerItem.find((item) => item.sortBy === sortBy)?.label}</p>
			</div>
		);
	}

	return (
		<div className="select-none text-zinc-500">
			<RankingListGridLayout type="header">
				<p>#</p>
				<p>info</p>
				{!hasStats ? null : hasRankChange(data) ? (
					<div className="grid grid-cols-2 items-center justify-items-end">
						{data.isLatest && SortButton("peak")}
						{/* <p className="col-start-2">achievement</p> */}
					</div>
				) : (
					<div className="grid grid-cols-4 items-center justify-items-end">
						{headerItem.map((item) => (
							<div key={item.sortBy}>{SortButton(item.sortBy)}</div>
						))}
					</div>
				)}
			</RankingListGridLayout>
		</div>
	);
}
