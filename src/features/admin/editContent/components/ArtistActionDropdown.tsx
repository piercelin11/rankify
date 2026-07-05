"use client";

import { ArtistData } from "@/types/data";
import deleteArtist from "../actions/deleteArtist";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import updateInfo from "../actions/updateInfo";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ArtistEditingForm from "./ArtistEditingForm";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useModal } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { useServerAction } from "@/lib/hooks/useServerAction";

type ArtistActionDropdownProps = { data: ArtistData };

export default function ArtistActionDropdown({
	data,
}: ArtistActionDropdownProps) {
	const { showCustom, showAlert, close } = useModal();
	const { toast } = useToast();
	const { execute: executeDeleteArtist } = useServerAction(deleteArtist);

	const { id } = data;

	async function handleUpdate() {
		const accessToken = await fetchSpotifyToken();
		updateInfo({ type: "artist", id, token: accessToken });
	}

	async function handleDelete() {
		try {
			const result = await executeDeleteArtist(id);
			toast({
				title: result.message,
				variant: result.type === "error" ? "destructive" : "default",
			});
		} catch (error) {
			if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
				toast({
					title: "Failed to delete artist.",
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
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() =>
							showCustom({
								content: <ArtistEditingForm data={data} onClose={close} />,
								title: "Edit Artist",
								description: `Make changes to ${data.name}`,
							})
						}
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleUpdate}>
						<UpdateIcon className="mr-2 h-4 w-4" />
						Update
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive"
						onClick={() =>
							showAlert({
								title: "Are You Sure?",
								description: "This action cannot be undone.",
								confirmText: "Delete",
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
