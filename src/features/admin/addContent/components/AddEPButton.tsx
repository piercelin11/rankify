"use client";

import ModalWrapper from "@/components/modals/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";
import AddButton from "@/components/buttons/AddButton";

type AddEPButtonProps = {
	artistId: string;
};

export default function AddEPButton({ artistId }: AddEPButtonProps) {
	const [isOpen, setOpen] = useState(false);

	function handleSubmit(EPId: string[], token: string) {
		return addAlbum({ artistId, albumId: EPId, type: "EP", token });
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
					type="EP"
					submitAction={handleSubmit}
				/>
			</ModalWrapper>

			<AddButton onClick={() => setOpen(true)} />
		</>
	);
}
