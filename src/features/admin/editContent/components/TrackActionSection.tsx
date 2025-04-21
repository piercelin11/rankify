"use client";

import React, { useState } from "react";
import ActionIconGroup from "./ActionIconGroup";
import deleteItem from "../actions/deleteItem";
import { AlbumData, TrackData } from "@/types/data";
import ModalWrapper from "@/components/modals/ModalWrapper";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import TrackEditingForm from "./TrackEditingForm";

type TrackActionSectionProps = {
	data: TrackData;
    albums: AlbumData[];
};

export default function TrackActionSection({
	data,
    albums,
}: TrackActionSectionProps) {
	const [isEditopen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const { id } = data;
	return (
		<div>
			<ActionIconGroup
				onEditClick={() => setEditOpen(true)}
				onDeleteClick={() => setDeleteOpen(true)}
			/>

			<ComfirmationModal
				onConfirm={() => deleteItem("track", id)}
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
					<TrackEditingForm
						trackData={data}
						albums={albums}
						onCancel={() => setEditOpen(false)}
					/>
				</ModalWrapper>
			)}
		</div>
	);
}
