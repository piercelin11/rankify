"use client";

import React, { useState } from "react";
import ActionIconGroup from "./ActionIconGroup";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import AlbumEditingForm from "./AlbumEditingForm";
import { AlbumData } from "@/types/data";
import deleteItem from "../actions/deleteItem";
import { Button } from "@/features/admin/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/features/admin/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

type AlbumActionSectionProps = { data: AlbumData };

export default function AlbumActionSection({ data }: AlbumActionSectionProps) {
	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const { id } = data;

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
				onConfirm={() => deleteItem({ type: "album", id })}
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
				<AlbumEditingForm data={data} setOpen={setEditOpen} />
			</ModalWrapper>
		</>
	);
}