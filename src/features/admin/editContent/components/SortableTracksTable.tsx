/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import {
	DndContext,
	closestCenter,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useTransition } from "react";
import { GripVertical } from "lucide-react";

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
import { useDragAndDrop } from "../hooks/useDragAndDrop";

type TracksTableProps = {
	tracks: TrackData[];
	albums: AlbumData[];
	className?: string;
}

// 拖曳手柄組件
function DragHandle({ trackId }: { trackId: string }) {
	const { attributes, listeners, setNodeRef } = useSortable({
		id: trackId,
	});

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			className="flex cursor-grab items-center justify-center p-1 active:cursor-grabbing"
		>
			<GripVertical className="h-4 w-4 text-muted-foreground" />
		</div>
	);
}


// 可排序的表格行組件
function SortableTableRow({
	track,
	table,
}: {
	track: TrackData;
	table: any;
}) {
	const {
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: track.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const row = table
		.getRowModel()
		.rows.find((r: any) => r.original.id === track.id);

	return (
		<TableRow
			ref={setNodeRef}
			style={style}
			className={cn("relative", isDragging && "z-50 opacity-50")}
			data-dragging={isDragging}
		>
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
}

export default function TracksTable({
	tracks,
	albums,
	className,
}: TracksTableProps) {
	// 根據 discNumber 分組
	const groupedByDisc = useMemo(() => {
		const groups = tracks.reduce((acc, track) => {
			const disc = track.discNumber || 1;
			if (!acc[disc]) acc[disc] = [];
			acc[disc].push(track);
			return acc;
		}, {} as Record<number, TrackData[]>);
		return groups;
	}, [tracks]);

	const discNumbers = Object.keys(groupedByDisc).map(Number).sort();
	const hasMultipleDiscs = discNumbers.length > 1;

	// 條件渲染：多個 disc 分別顯示，單個 disc 直接顯示
	if (hasMultipleDiscs) {
		return (
			<div className={cn("w-full space-y-6", className)}>
				{discNumbers.map(discNumber => (
					<div key={discNumber} className="space-y-3">
						<h3 className="text-lg font-medium text-foreground pb-2">
							Disc {discNumber}
						</h3>
						<TracksTableContent 
							tracks={groupedByDisc[discNumber]} 
							albums={albums}
							discNumber={discNumber}
						/>
					</div>
				))}
			</div>
		);
	}

	// 單個 disc 的情況，直接渲染表格
	return (
		<TracksTableContent 
			tracks={tracks} 
			albums={albums}
			className={className}
		/>
	);
}

// TracksTableContent 子組件 - 處理單個 disc 的表格
type TracksTableContentProps = {
	tracks: TrackData[];
	albums: AlbumData[];
	className?: string;
	discNumber?: number;
}

function TracksTableContent({
	tracks,
	albums,
	className,
	discNumber,
}: TracksTableContentProps) {
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
						album: updates.album === null ? "" : track.album?.name ?? "",
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

	const { sensors, handleDragEnd } = useDragAndDrop({ data, setData, handleUpdateTrack });


	const columns: ColumnDef<TrackData>[] = [
		{
			id: "drag",
			header: "",
			cell: ({ row }) => <DragHandle trackId={row.original.id} />,
			size: 50,
			minSize: 50,
			maxSize: 50,
		},
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
				<DndContext
					id={`tracks-table-disc-${discNumber || 'single'}`}
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<Table className="table-fixed">
						<colgroup>
							<col style={{ width: '50px' }} />
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
							<SortableContext
								items={data.map((track) => track.id)}
								strategy={verticalListSortingStrategy}
							>
								{data.length ? (
									data.map((track) => (
										<SortableTableRow
											key={track.id}
											track={track}
											table={table}
										/>
									))
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
							</SortableContext>
						</TableBody>
					</Table>
				</DndContext>
			</div>
		</div>
	);
}
