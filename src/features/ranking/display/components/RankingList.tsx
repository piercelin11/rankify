"use client";

import React, { ReactNode, useState } from "react";
import RankChangeIcon from "./RankChangeIcon";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";

export type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

export type Column<T> = {
	key: keyof T;
	header: string;
	render?: (value: T[keyof T]) => ReactNode;
};

type RankingListProps<T> = {
	data: T[];
	columns: Column<T>[];
	hasHeader?: boolean;
};

export default function RankingList<T extends RankingListDataTypeExtend>({
	data,
	columns,
	hasHeader = true,
}: RankingListProps<T>) {
	return (
		<>
			{hasHeader && <RankingHeader columns={columns} />}
			{data.map((row) => (
				<RankingListItem key={row.id} data={row} columns={columns} />
			))}
		</>
	);
}

type RankingListItemProps<T> = {
	data: T;
	columns: Column<T>[];
};

export function RankingListItem<T extends RankingListDataTypeExtend>({
	data,
	columns,
}: RankingListItemProps<T>) {
	const [isHover, setHover] = useState(false);
	return (
		<Link href={`/artist/${data.artistId}/track/${data.id}`}>
			<div
				className="group relative overflow-hidden"
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
			>
				<div className="z-10 grid cursor-pointer select-none grid-cols-[30px,_3fr] items-center gap-3 rounded border-b border-neutral-600/40 py-2 sm:py-3 sm:pr-6 md:grid-cols-[45px,_3fr,_2fr]">
					<p className="justify-self-end font-numeric text-lg font-medium tabular-nums text-neutral-400 group-hover:text-neutral-100">
						{data.ranking}
					</p>
					<div className="flex items-center gap-2 overflow-hidden">
						{data.rankChange !== undefined && <RankChangeIcon data={data} />}
						<div className="relative min-h-16 min-w-16">
							<Image
								className="rounded-lg"
								fill
								sizes="(max-width: 768px) 56px, 64px"
								src={data.img || ""}
								alt={data.name}
							/>
						</div>
						<div className="overflow-hidden">
							<p className="overflow-hidden text-ellipsis text-nowrap text-neutral-300 group-hover:text-neutral-100">
								{data.name}
							</p>
							<p className="overflow-hidden text-ellipsis text-nowrap text-sm text-neutral-500 group-hover:text-neutral-100">
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
								/>
							))}
						</div>
					)}
				</div>
				<div className="absolute top-0 -z-10 h-full w-full translate-y-full bg-neutral-900 transition-all duration-100 ease-in-out group-hover:translate-y-0" />
			</div>
		</Link>
	);
}

type RankingListCellProps<T> = {
	columnKey: string;
	render?: (value: T) => ReactNode;
	value: T;
};

export function RankingListCell<T>({
	columnKey,
	render,
	value,
}: RankingListCellProps<T>) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort");
	return (
		<div>
			{render ? (
				render(value)
			) : (
				<p
					className={cn("text-neutral-500 group-hover:text-neutral-100", {
						"text-neutral-100": sortQuery === columnKey
					})}
				>
					{value !== null ? String(value) : ""}
				</p>
			)}
		</div>
	);
}

type RankingHeaderProps<T> = {
	columns: Column<T>[];
};

export function RankingHeader<T extends RankingListDataTypeExtend>({
	columns,
}: RankingHeaderProps<T>) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort");
	return (
		<div className="hidden cursor-pointer select-none grid-cols-[45px,_3fr,_2fr] items-center gap-3 rounded border-b border-neutral-600/40 py-3 pl-2 pr-6 text-neutral-500 md:grid">
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
						<RankingHeaderCell column={column} />
					</div>
				))}
			</div>
		</div>
	);
}

type RankingHeaderCellProps<T> = {
	column: Column<T>;
};

export function RankingHeaderCell<T extends RankingListDataTypeExtend>({
	column,
}: RankingHeaderCellProps<T>) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort");
	const orderQuery = searchParams.get("order");

	function handleClick(sortBy: keyof T) {
		const params = new URLSearchParams(searchParams);

		if (sortBy !== sortQuery) {
			params.set("sort", String(sortBy));
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

	return (
		<div
			className={cn("flex items-center gap-1", {
				"text-neutral-100": column.key === sortQuery,
			})}
			onClick={() => {
				handleClick(column.key);
			}}
		>
			{column.key !== sortQuery ? (
				<CaretSortIcon />
			) : orderQuery === "asc" ? (
				<ArrowUpIcon />
			) : (
				<ArrowDownIcon />
			)}
			<p>{column.header}</p>
		</div>
	);
}
