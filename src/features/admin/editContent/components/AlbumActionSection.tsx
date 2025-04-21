"use client";

import React, { useState } from "react";
import ActionIconGroup from "./ActionIconGroup";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import AlbumEditingForm from "./AlbumEditingForm";
import { AlbumData } from "@/types/data";
import deleteItem from "../actions/deleteItem";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import updateInfo from "../actions/updateInfo";

type AlbumActionSectionProps = { data: AlbumData };

export default function AlbumActionSection({ data }: AlbumActionSectionProps) {
	const [isEditopen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const { id } = data;

	async function handleUpdate() {
		const accessToken = await fetchSpotifyToken();
		updateInfo("album", id, accessToken);
	}

	return (
		<div>
			<ActionIconGroup
				onUpdateClick={handleUpdate}
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

			{isEditopen && (
				<ModalWrapper setOpen={setEditOpen}>
					<AlbumEditingForm data={data} setOpen={setEditOpen} />
				</ModalWrapper>
			)}
		</div>
	);
}
