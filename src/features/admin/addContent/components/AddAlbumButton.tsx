"use client";

import ContentSelectionForm from "./ContentSelectionForm";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";
import AddButton from "@/components/buttons/AddButton";
import { useModal } from "@/contexts";

type AddAlbumButtonProps = {
	artistId: string;
};

export default function AddAlbumButton({ artistId }: AddAlbumButtonProps) {
	const { showCustom, close } = useModal();

	function handleSubmit(albumId: string[], token: string) {
		return addAlbum({ artistId, albumId, type: "ALBUM", token });
	}

	return (
		<AddButton
			onClick={() =>
				showCustom({
					title: "Add Album",
					content: (
						<ContentSelectionForm
							artistId={artistId}
							onCancel={close}
							type="Album"
							submitAction={handleSubmit}
						/>
					),
				})
			}
		/>
	);
}
