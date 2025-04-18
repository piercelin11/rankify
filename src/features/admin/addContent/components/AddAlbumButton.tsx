"use client"

import ModalWrapper from "@/components/general/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import { AddButton } from "@/components/ui/Button";
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
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<ContentSelectionForm
						artistId={artistId}
						onCancel={() => setOpen(false)}
						type="Album"
						submitAction={handleSubmit}
					/>
				</ModalWrapper>
			)}

			<AddButton variant="gray" onClick={() => setOpen(true)} />
		</>
	);
}
