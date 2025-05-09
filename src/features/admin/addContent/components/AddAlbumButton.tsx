"use client";

import ModalWrapper from "@/components/modals/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import { AddButton } from "@/components/buttons/Button";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";

type AddAlbumButtonProps = {
	artistId: string;
};

export default function AddAlbumButton({ artistId }: AddAlbumButtonProps) {
	const [isOpen, setOpen] = useState(false);

	function handleSubmit(albumId: string[], token: string) {
		return addAlbum(artistId, albumId, "ALBUM", token);
	}

	return (
		<>
			<ModalWrapper
				onRequestClose={() => setOpen(false)}
				isRequestOpen={isOpen}
			>
				<ContentSelectionForm
					artistId={artistId}
					onCancel={() => setOpen(false)}
					type="Album"
					submitAction={handleSubmit}
				/>
			</ModalWrapper>

			<AddButton variant="secondary" onClick={() => setOpen(true)} />
		</>
	);
}
