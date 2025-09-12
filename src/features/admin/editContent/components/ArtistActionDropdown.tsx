"use client";

import React, { useState } from "react";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import { ArtistData } from "@/types/data";
import deleteItem from "../actions/deleteItem";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import updateInfo from "../actions/updateInfo";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import ArtistEditingForm from "./ArtistEditingForm";
import { UpdateIcon } from "@radix-ui/react-icons";

type ArtistActionDropdownProps = { data: ArtistData };

export default function ArtistActionDropdown({
	data,
}: ArtistActionDropdownProps) {
	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const { id } = data;

	async function handleUpdate() {
		const accessToken = await fetchSpotifyToken();
		updateInfo({ type: "artist", id, token: accessToken });
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
					<DropdownMenuItem onClick={() => setEditOpen(true)}>
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
						onClick={() => setDeleteOpen(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ComfirmationModal
				onConfirm={() => deleteItem({ type: "artist", id })}
				onCancel={() => setDeleteOpen(false)}
				comfirmLabel="Delete"
				cancelLabel="Cancel"
				isOpen={isDeleteOpen}
				setOpen={setDeleteOpen}
				title="Are You Sure?"
				description="This action cannot be undone."
				warning="Warning: All associated data will also be removed."
			/>
			<ModalWrapper
				onRequestClose={() => setEditOpen(false)}
				isRequestOpen={isEditOpen}
			>
				<ArtistEditingForm data={data} setOpen={setEditOpen} />
			</ModalWrapper>
		</>
	);
}