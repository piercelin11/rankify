"use client";

import ModalWrapper from "@/components/modals/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";
import AddButton from "@/components/buttons/AddButton";

type AddAlbumButtonProps = {
	artistId: string;
};

export default function AddAlbumButton({ artistId }: AddAlbumButtonProps) {
	const [isOpen, setOpen] = useState(false);

	function handleSubmit(albumId: string[], token: string) {
		return addAlbum({artistId, albumId, type: "ALBUM", token});
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

			<AddButton onClick={() => setOpen(true)} />
		</>
	);
}
