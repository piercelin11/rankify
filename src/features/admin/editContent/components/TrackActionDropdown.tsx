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
import deleteTrack from "../actions/deleteTrack";
import { useServerAction } from "@/lib/hooks/useServerAction";
import { cn } from "@/lib/utils";

type TrackActionDropdownProps = {
	data: TrackData;
	albums: AlbumData[];
};

export default function TrackActionDropdown({
	data,
	albums,
}: TrackActionDropdownProps) {
	const { showAlert, showCustom, close } = useModal();
	const { toast } = useToast();
	const [isFetchingPreview, startFetchPreview] = useTransition();
	const { execute: executeDeleteTrack } = useServerAction(deleteTrack);

	function handleFetchPreviewUrl() {
		startFetchPreview(async () => {
			const result = await fetchTrackPreviewUrl(data.id);
			toast({
				title: result.message,
				variant: result.type === "error" ? "destructive" : "default",
			});
		});
	}

	async function handleDelete() {
		try {
			const result = await executeDeleteTrack(data.id);
			toast({
				title: result.message,
				variant: result.type === "error" ? "destructive" : "default",
			});
		} catch (error) {
			if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
				toast({
					title: "Failed to delete track.",
					variant: "destructive",
				});
			}
		}
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
					<DropdownMenuItem
						className="text-destructive"
						onClick={() =>
							showAlert({
								title: "Are You Sure?",
								description: "This action cannot be undone.",
								confirmText: "Delete",
								variant: "destructive",
								onConfirm: handleDelete,
							})
						}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
