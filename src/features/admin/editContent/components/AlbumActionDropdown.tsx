"use client";

import { useTransition } from "react";
import AlbumEditingForm from "./AlbumEditingForm";
import { AlbumData } from "@/types/data";
import deleteAlbum from "../actions/deleteAlbum";
import { fetchAlbumPreviewUrls } from "../actions/fetchAlbumPreviewUrls";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, RefreshCw, Trash2 } from "lucide-react";
import { useModal } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { useServerAction } from "@/lib/hooks/useServerAction";
import { cn } from "@/lib/utils";

type AlbumActionDropdownProps = { data: AlbumData };

export default function AlbumActionDropdown({ data }: AlbumActionDropdownProps) {
	const {showAlert, showCustom, close} = useModal();
	const { toast } = useToast();
	const [isFetchingPreviews, startFetchPreviews] = useTransition();
	const { execute: executeDeleteAlbum } = useServerAction(deleteAlbum);

	const { id } = data;

	function handleFetchPreviewUrls() {
		startFetchPreviews(async () => {
			const result = await fetchAlbumPreviewUrls(id);
			toast({
				title: result.message,
				variant: result.type === "error" ? "destructive" : "default",
			});
		});
	}

	async function handleDelete() {
		try {
			const result = await executeDeleteAlbum(id);
			toast({
				title: result.message,
				variant: result.type === "error" ? "destructive" : "default",
			});
		} catch (error) {
			if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
				toast({
					title: "Failed to delete album.",
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
					<DropdownMenuItem onClick={() => showCustom({
						content: <AlbumEditingForm data={data} onClose={close} />,
						title: "Edit Album",
						description: `Make changes to ${data.name}`,
					})}>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={isFetchingPreviews}
						onClick={handleFetchPreviewUrls}
					>
						<RefreshCw className={cn("mr-2 h-4 w-4", isFetchingPreviews && "animate-spin")} />
						{isFetchingPreviews ? "Fetching..." : "Get Preview URLs"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive"
						onClick={() => showAlert({
							title: "Are You Sure?",
							description: "This action cannot be undone.",
							confirmText: "Delete",
							variant: "destructive",
							onConfirm: handleDelete,
						})}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}