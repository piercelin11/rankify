"use client";

import React, { useState } from "react";
import ActionIconGroup from "./ActionIconGroup";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import AlbumEditingForm from "./AlbumEditingForm";
import { AlbumData, ArtistData } from "@/types/data";
import deleteItem from "../actions/deleteItem";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import updateInfo from "../actions/updateInfo";
import ArtistEditingForm from "./ArtistEditingForm";

type ArtistActionSectionProps = { data: ArtistData };

export default function ArtistActionSection({
	data,
}: ArtistActionSectionProps) {
	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const { id } = data;

	async function handleUpdate() {
		const accessToken = await fetchSpotifyToken();
		updateInfo("artist", id, accessToken);
	}

	return (
		<div>
			<ActionIconGroup
				onUpdateClick={handleUpdate}
				onEditClick={() => setEditOpen(true)}
				onDeleteClick={() => setDeleteOpen(true)}
				className="justify-end"
			/>
			<ComfirmationModal
				onConfirm={() => deleteItem("artist", id)}
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
		</div>
	);
}
