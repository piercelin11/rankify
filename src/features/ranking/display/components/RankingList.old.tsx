"use client";

import React, { ReactNode } from "react";
import RankChangeIcon from "./RankChangeIcon";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";

export type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

export type Column<T> = {
	key: keyof T;
	header: string;
	render?: (value: T[keyof T]) => ReactNode;
	onClick?: () => void;
};

type RankingListItemProps<T> = {
	data: T;
	columns: Column<T>[];
	selectedHeader?: string;
	index?: number;
};

export function RankingListItem<T extends RankingListDataTypeExtend>({
	data,
	columns,
	selectedHeader,
	index,
}: RankingListItemProps<T>) {
	return (
		<Link href={`/artist/${data.artistId}/track/${data.id}`}>
			<div className="group relative">
				<div className="grid-ranking-list z-10 select-none items-center gap-3 rounded border-b border-neutral-500/20 py-2.5 sm:pr-6">
					<p className="justify-self-end font-numeric text-lg font-medium tabular-nums text-neutral-400 group-hover:text-neutral-100">
						{index || data.ranking}
					</p>
					<div className="flex items-center gap-2 overflow-hidden">
						{data.rankChange !== undefined && (
							<RankChangeIcon rankChange={data.rankChange} />
						)}
						<div className="relative min-h-14 min-w-14">
							<Image
								className="rounded-lg"
								fill
								sizes="(max-width: 768px) 56px, 56px"
								src={data.img || ""}
								alt={data.name}
								quality={50}
							/>
						</div>
						<div className="overflow-hidden">
							<p className="overflow-hidden text-ellipsis text-nowrap text-neutral-100 group-hover:text-neutral-50">
								{data.name}
							</p>
							<p className="overflow-hidden text-ellipsis text-nowrap text-sm text-neutral-300/70 group-hover:text-neutral-100">
								{data.album?.name}
							</p>
						</div>
					</div>
					{columns.length !== 0 && (
						<div
							className="hidden items-center justify-items-end font-numeric md:grid"
							style={{
								gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
							}}
						>
							{columns.map((column) => (
								<RankingListCell
									key={String(column.key)}
									columnKey={String(column.key)}
									render={column.render}
									value={data[column.key]}
									selectedHeader={selectedHeader}
								/>
							))}
						</div>
					)}
				</div>
				<div className="absolute top-0 -z-10 h-full w-full overflow-hidden">
					<div className="absolute top-0 h-full w-full translate-y-full bg-neutral-900 transition-all duration-150 ease-in-out group-hover:translate-y-0" />
				</div>
			</div>
		</Link>
	);
}

type RankingListCellProps<T> = {
	columnKey: string;
	render?: (value: T) => ReactNode;
	selectedHeader?: string;
	value: T;
};

function RankingListCell<T>({
	columnKey,
	render,
	value,
	selectedHeader,
}: RankingListCellProps<T>) {
	return (
		<div>
			{render ? (
				render(value)
			) : (
				<p
					className={cn("text-neutral-500 group-hover:text-neutral-100", {
						"text-neutral-100": selectedHeader === columnKey,
					})}
				>
					{value != null ? String(value) : ""}
				</p>
			)}
		</div>
	);
}

type RankingHeaderProps<T> = {
	columns: Column<T>[];
	selectedHeader?: string;
	sortOrder?: "asc" | "desc" | null;
};

export function RankingHeader<T extends RankingListDataTypeExtend>({
	columns,
	selectedHeader,
	sortOrder,
}: RankingHeaderProps<T>) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort");
	return (
		<div className="grid-ranking-list hidden select-none items-center gap-3 rounded border-b border-neutral-600/30 py-3 pl-2 pr-6 text-neutral-300/70 md:grid">
			<p>#</p>
			<p>info</p>
			<div
				className="grid items-center justify-items-end font-numeric"
				style={{
					gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
				}}
			>
				{columns.map((column) => (
					<div
						className={cn({
							"text-neutral-100": sortQuery === column.key,
						})}
						key={String(column.key)}
					>
						<RankingHeaderCell
							column={column}
							selectedHeader={selectedHeader}
							sortOrder={sortOrder}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

type RankingHeaderCellProps<T> = {
	column: Column<T>;
	selectedHeader?: string;
	sortOrder?: "asc" | "desc" | null;
};

export function RankingHeaderCell<T extends RankingListDataTypeExtend>({
	column,
	selectedHeader,
	sortOrder,
}: RankingHeaderCellProps<T>) {
	return (
		<button
			className={cn("flex items-center gap-1", {
				"text-neutral-100": column.key === selectedHeader,
				"hover:text-neutral-100": column.onClick,
			})}
			onClick={column.onClick}
		>
			{!column.onClick ? (
				""
			) : column.key !== selectedHeader ? (
				<CaretSortIcon />
			) : sortOrder === "asc" ? (
				<ArrowUpIcon />
			) : (
				<ArrowDownIcon />
			)}
			<p>{column.header}</p>
		</button>
	);
}
