"use client";

import ContentSelectionForm from "./ContentSelectionForm";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";
import AddButton from "@/components/buttons/AddButton";
import { useModal } from "@/lib/hooks/useModal";

type AddAlbumButtonProps = {
	artistId: string;
};

export default function AddAlbumButton({ artistId }: AddAlbumButtonProps) {
	const { showCustom, closeTop } = useModal();

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
							onCancel={closeTop}
							type="Album"
							submitAction={handleSubmit}
						/>
					),
				})
			}
		/>
	);
}
