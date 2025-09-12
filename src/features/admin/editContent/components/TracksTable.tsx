/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useTransition } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/features/admin/ui/table";

import { AlbumData, TrackData } from "@/types/data";
import { cn } from "@/lib/utils";
import { $Enums } from "@prisma/client";
import updateTrack from "../actions/updateTrack";
import { InlineEditCell, InlineSelectCell } from "./InlineEditor";
import TrackActionDropdown from "./TrackActionDropdown";
import Image from "next/image";

type TracksTableProps = {
	tracks: TrackData[];
    albums: AlbumData[]
	className?: string;
}

export default function TracksTable({
	tracks,
    albums,
	className,
}: TracksTableProps) {
	const [data, setData] = useState(tracks);
	const [, startTransition] = useTransition();

	// 當 tracks prop 改變時更新本地狀態
	useEffect(() => {
		setData(tracks);
	}, [tracks]);

	const handleUpdateTrack = async (trackId: string, updates: Partial<TrackData>) => {
		const track = data.find((t) => t.id === trackId);
		if (!track) return;

		// 樂觀更新 - 立即更新 UI
		setData((prev) =>
			prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t))
		);

		startTransition(async () => {
			try {
				const result = await updateTrack({
					originalData: track,
					formData: {
						name: updates.name || track.name,
						album: updates.album?.name || track.album?.name || "",
						trackNumber: updates.trackNumber || track.trackNumber || 1,
						discNumber: updates.discNumber || track.discNumber || 1,
						type: updates.type || track.type,
						color: updates.color || track.color || undefined,
					},
				});

				if (result.type !== "success") {
					console.error("Failed to update track:", result.message);
					// 如果失敗，回滾變更
					setData((prev) =>
						prev.map((t) => (t.id === trackId ? { ...t, ...track } : t))
					);
				}
			} catch (error) {
				console.error("Error updating track:", error);
				// 如果發生錯誤，回滾變更
				setData((prev) =>
					prev.map((t) => (t.id === trackId ? { ...t, ...track } : t))
				);
			}
		});
	};


	const columns: ColumnDef<TrackData>[] = [
		{
			accessorKey: "trackNumber",
			header: "#",
			cell: ({ row }) => (
				<div className="w-8 text-center font-medium text-muted-foreground">
					{row.original.trackNumber || "-"}
				</div>
			),
			size: 60,
			minSize: 60,
			maxSize: 60,
		},
		{
			accessorKey: "img",
			header: "",
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Image
						src={row.original.img || "/placeholder-album.png"}
						alt={row.original.name}
						className="h-10 w-10 rounded object-cover"
					/>
				</div>
			),
			size: 60,
			minSize: 60,
			maxSize: 60,
		},
		{
			accessorKey: "name",
			header: "Track",
			cell: ({ row }) => (
				<InlineEditCell
					value={row.original.name}
					onSave={(value) => {
						handleUpdateTrack(row.original.id, { name: value });
					}}
				/>
			),
			size: 300,
			minSize: 200,
			maxSize: 400,
		},
		{
			accessorKey: "album",
			header: "Album",
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					{row.original.album?.name || "No album"}
				</div>
			),
			size: 200,
			minSize: 150,
			maxSize: 250,
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<InlineSelectCell
					value={row.original.type}
					onSave={(value) => {
						handleUpdateTrack(row.original.id, {
							type: value as $Enums.TrackType,
						});
					}}
					options={Object.values($Enums.TrackType).map((type) => ({
						value: type,
						label: type,
					}))}
				/>
			),
			size: 120,
			minSize: 100,
			maxSize: 150,
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<TrackActionDropdown
					data={row.original}
					albums={albums}
					handleUpdateTrack={handleUpdateTrack}
				/>
			),
			size: 80,
			minSize: 80,
			maxSize: 80,
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		columnResizeMode: 'onChange',
		defaultColumn: {
			size: 150,
			minSize: 50,
			maxSize: 500,
		},
	});

	return (
		<div className={cn("w-full", className)}>
			<div className="rounded-md border border-muted">
				<Table className="table-fixed">
					<colgroup>
						<col style={{ width: '60px' }} />
						<col style={{ width: '60px' }} />
						<col style={{ width: '300px' }} />
						<col style={{ width: '200px' }} />
						<col style={{ width: '120px' }} />
						<col style={{ width: '80px' }} />
					</colgroup>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="border-muted">
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="border-muted">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{data.length ? (
							data.map((track) => {
								const row = table
									.getRowModel()
									.rows.find((r: any) => r.original.id === track.id);
								
								return (
									<TableRow key={track.id}>
										{row &&
											row
												.getVisibleCells()
												.map((cell: any) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 border-muted text-center"
								>
									No tracks found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}