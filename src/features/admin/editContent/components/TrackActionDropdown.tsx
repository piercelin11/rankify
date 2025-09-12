"use client";

import React from "react";
import { TrackData, AlbumData } from "@/types/data";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import TrackEditingForm from "./TrackEditingForm";
import { useModal } from "@/lib/hooks/useModal";

type TrackActionDropdownProps = {
	data: TrackData;
	albums: AlbumData[];
};

export default function TrackActionDropdown({
	data,
	albums,
}: TrackActionDropdownProps) {
	const { showCustom, closeTop } = useModal();

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
					<DropdownMenuItem
						onClick={() =>
							showCustom({
								title: "Edit Track",
								content: (
									<TrackEditingForm
										track={data}
										albums={albums}
										onClose={closeTop}
									/>
								),
							})
						}
					>
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
		</>
	);
}
