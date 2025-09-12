"use client";

import React, { useState } from "react";
import { TrackData, AlbumData } from "@/types/data";
import { Button } from "@/features/admin/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/features/admin/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import TrackEditingForm from "./TrackEditingForm";

type TrackActionDropdownProps = {
	data: TrackData;
	albums: AlbumData[];
	handleUpdateTrack: (
		trackId: string,
		updates: Partial<TrackData>
	) => Promise<void>;
};

export default function TrackActionDropdown({
	data,
	albums,
	handleUpdateTrack,
}: TrackActionDropdownProps) {
	const [isEditOpen, setEditOpen] = useState(false);
	//const [_isDeleteOpen, _setDeleteOpen] = useState(false);

	//const { id: _id } = data;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-destructive">
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<TrackEditingForm
				track={data}
				albums={albums}
				isOpen={isEditOpen}
				onOpenChange={setEditOpen}
				onUpdateTrack={handleUpdateTrack}
			>
				<div />
			</TrackEditingForm>
		</>
	);
}
