"use client";

import React, { useState } from "react";
import ActionIconGroup from "./ActionIconGroup";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import AlbumEditingForm from "./AlbumEditingForm";
import { AlbumData } from "@/types/data";
import deleteItem from "../actions/deleteItem";

type AlbumActionSectionProps = { data: AlbumData };

export default function AlbumActionSection({ data }: AlbumActionSectionProps) {
	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const { id } = data;

	return (
		<div>
			<ActionIconGroup
				onEditClick={() => setEditOpen(true)}
				onDeleteClick={() => setDeleteOpen(true)}
			/>
			<ComfirmationModal
				onConfirm={() => deleteItem("album", id)}
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
		</div>
	);
}
