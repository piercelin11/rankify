"use client";

import React, { useTransition } from "react";
import { TrackData, AlbumData } from "@/types/data";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, RefreshCw, Trash2 } from "lucide-react";
import TrackEditingForm from "./TrackEditingForm";
import { useModal } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { fetchTrackPreviewUrl } from "../actions/fetchTrackPreviewUrl";
import { cn } from "@/lib/utils";

type TrackActionDropdownProps = {
	data: TrackData;
	albums: AlbumData[];
};

export default function TrackActionDropdown({
	data,
	albums,
}: TrackActionDropdownProps) {
	const { showCustom, close } = useModal();
	const { toast } = useToast();
	const [isFetchingPreview, startFetchPreview] = useTransition();

	function handleFetchPreviewUrl() {
		startFetchPreview(async () => {
			const result = await fetchTrackPreviewUrl(data.id);
			toast({
				title: result.message,
				variant: result.type === "error" ? "destructive" : "default",
			});
		});
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreHorizontal className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					<DropdownMenuItem
						onClick={() =>
							showCustom({
								title: "Edit Track",
								content: (
									<TrackEditingForm
										track={data}
										albums={albums}
										onClose={close}
									/>
								),
							})
						}
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={isFetchingPreview}
						onClick={handleFetchPreviewUrl}
					>
						<RefreshCw
							className={cn("mr-2 h-4 w-4", isFetchingPreview && "animate-spin")}
						/>
						{isFetchingPreview ? "Fetching..." : "Get Preview URL"}
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
