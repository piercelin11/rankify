"use client";

import ContentSelectionForm from "./ContentSelectionForm";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";
import AddButton from "@/components/buttons/AddButton";
import { useModal } from "@/contexts";

type AddEPButtonProps = {
	artistId: string;
};

export default function AddEPButton({ artistId }: AddEPButtonProps) {
	const { showCustom, close } = useModal();

	function handleSubmit(EPId: string[], token: string) {
		return addAlbum({ artistId, albumId: EPId, type: "EP", token });
	}

	return (
		<>
			<AddButton
				onClick={() =>
					showCustom({
						title: "Add EP",
						content: (
							<ContentSelectionForm
								artistId={artistId}
								onCancel={close}
								type="EP"
								submitAction={handleSubmit}
							/>
						),
					})
				}
			/>
		</>
	);
}
