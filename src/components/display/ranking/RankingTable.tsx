"use client";

import React from "react";
import RankChangeIconDisplay from "./RankChangeIconDisplay";
import { useSearchParams } from "next/navigation";
import { AlbumData, ArtistData } from "@/types/data";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";
import Link from "next/link";

export type RankingTableDataTypeExtend = {
	id: string;
	ranking: number;
	img: string | null;
	name: string;
	albumId?: string | null
	album?: AlbumData | null;
	artist?: ArtistData;
	artistId: string;
	rankChange?: number | null;
};

type Column<T> = {
	key: keyof T;
	header: string;
};

type RankingTableProps<T> = {
	data: T[];
	columns: Column<T>[];
	hasHeader?: boolean;
};

export default function RankingTable<T extends RankingTableDataTypeExtend>({
	data,
	columns,
	hasHeader = true,
}: RankingTableProps<T>) {
	return (
		<div>
			{hasHeader && <RankingHeader columns={columns} />}
			{data.map((row) => (
				<RankingRow key={row.id} data={row} columns={columns} />
			))}
		</div>
	);
}

type RankingRowProps<T> = {
	data: T;
	columns: Column<T>[];
};

export function RankingRow<T extends RankingTableDataTypeExtend>({
	data,
	columns,
}: RankingRowProps<T>) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort");

	return (
		<Link href={`/artist/${data.artistId}/track/${data.id}`}>
		<div className="grid cursor-pointer select-none grid-cols-[45px,_3fr,_2fr] items-center gap-3 rounded border-b border-zinc-900 py-3 pl-2 pr-6 hover:bg-zinc-900">
			<p className="mr-1 justify-self-end font-numeric text-lg font-medium tabular-nums text-zinc-400">
				{data.ranking}
			</p>
			<div className="flex items-center gap-3">
				{data.rankChange !== undefined && <RankChangeIconDisplay data={data} />}
				<img
					className="rounded"
					src={data.img || undefined}
					alt={data.name}
					width={65}
					height={65}
				/>
				<div>
					<p className="font-medium">{data.name}</p>
					<p className="text-sm text-zinc-500">{data.album?.name}</p>
				</div>
			</div>
			<div
				className="grid items-center justify-items-end font-numeric"
				style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
			>
				{columns.map((column) => (
					<p
						className={
							sortQuery === column.key ? "text-zinc-100" : "text-zinc-500"
						}
						key={String(column.key)}
					>
						{(data[column.key] as number) || ""}
					</p>
				))}
			</div>
		</div>
		</Link>
	);
}

type RankingHeaderProps<T> = {
	columns: Column<T>[];
};

export function RankingHeader<T extends RankingTableDataTypeExtend>({
	columns,
}: RankingHeaderProps<T>) {
	const searchParams = useSearchParams();
	const sortQuery = searchParams.get("sort");
	return (
		<div className="grid cursor-pointer select-none grid-cols-[45px,_3fr,_2fr] items-center gap-3 rounded border-b border-zinc-900 py-3 pl-2 pr-6 text-zinc-500">
			<p>#</p>
			<p>info</p>
			<div
				className="grid items-center justify-items-end font-numeric"
				style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
			>
				{columns.map((column) => (
					<div
						className={sortQuery === column.key ? "text-zinc-100" : ""}
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

export function RankingHeaderCell<T extends RankingTableDataTypeExtend>({
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
				"text-zinc-100": column.key === sortQuery,
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
