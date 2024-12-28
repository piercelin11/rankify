"use client";
import React, { useState } from "react";
import RankingListGridLayout from "./RankingListGridLayout";
import { hasRankChange } from "./RankingListItem";
import { TrackStatsType } from "@/lib/data/ranking/overall/getTrackStats";
import { TrackHistoryType } from "@/lib/data/ranking/history/getTrackRankingHistory";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";
import { useSearchParams } from "next/navigation";

const overviewHeaderItem = [
	{ label: "peak", sortBy: "peak" },
	{ label: "gap", sortBy: "gap" },
	{ label: "chartrun", sortBy: "totalChartRun" },
	{ label: "top 10s", sortBy: "top10Count" },
] as const;

export type HeaderSortByType = (typeof overviewHeaderItem)[number]["sortBy"];

type RankingListHeaderProps = {
	data: TrackStatsType | TrackHistoryType;
	hasStats: boolean;
};

export default function RankingListHeader({ data, hasStats }: RankingListHeaderProps) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort") as HeaderSortByType | null;
	const orderQuery = searchParams.get("order") as "asc" | "desc" | null;

	function handleClick(sortBy: HeaderSortByType) {
		if (sortBy !== sortQuery) {
			window.history.replaceState(
				null,
				"",
				`?${new URLSearchParams({
					sort: sortBy,
					order: "asc",
				})}`
			);
		} else {
			if (orderQuery === "asc") {
				window.history.replaceState(
					null,
					"",
					`?${new URLSearchParams({
						sort: sortBy,
						order: "desc",
					})}`
				);
			} else {
				const url = new URL(window.location.href);
				url.search = "";
				window.history.replaceState(null, "", url.toString());
			}
		}
	}

	return (
		<div className="text-zinc-500 select-none">
			<RankingListGridLayout type="header">
				<p>#</p>
				<p>info</p>
				{!hasStats ? null : hasRankChange(data) ? (
					<div className="grid grid-cols-2 items-center justify-items-end">
						<div
							key="peak"
							className={cn("flex items-center gap-1", {
								"text-zinc-100": "peak" === sortQuery,
							})}
							onClick={() => {
								if (handleClick) handleClick("peak");
							}}
						>
							{"peak" !== sortQuery ? (
								<CaretSortIcon />
							) : orderQuery === "asc" ? (
								<ArrowUpIcon />
							) : (
								<ArrowDownIcon />
							)}
							<p>peak</p>
						</div>
						<p className="col-start-2">achievement</p>
					</div>
				) : (
					<div className="grid grid-cols-4 items-center justify-items-end">
						{overviewHeaderItem.map((item) => (
							<div
								key={item.sortBy}
								className={cn("flex items-center gap-1", {
									"text-zinc-100": item.sortBy === sortQuery,
								})}
								onClick={() => {
									handleClick(item.sortBy);
								}}
							>
								{item.sortBy !== sortQuery ? (
									<CaretSortIcon />
								) : orderQuery === "asc" ? (
									<ArrowUpIcon />
								) : (
									<ArrowDownIcon />
								)}
								<p>{item.label}</p>
							</div>
						))}
					</div>
				)}
			</RankingListGridLayout>
		</div>
	);
}

