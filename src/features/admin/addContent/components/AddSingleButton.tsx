"use client";

import ModalWrapper from "@/components/modals/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import Button, { AddButton } from "@/components/buttons/Button";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";
import { PlusIcon } from "@radix-ui/react-icons";
import addSingle from "@/features/admin/addContent/actions/addSingle";

type AddSingleButtonProps = {
	artistId: string;
};

export default function AddSingleButton({ artistId }: AddSingleButtonProps) {
	const [isOpen, setOpen] = useState(false);

	function handleSubmit(singleId: string[], token: string) {
		return addSingle(artistId, singleId, token);
	}

	return (
		<>
			{isOpen && (
				<ModalWrapper
					onRequestClose={() => setOpen(false)}
					isRequestOpen={isOpen}
				>
					<ContentSelectionForm
						artistId={artistId}
						onCancel={() => setOpen(false)}
						type="Single"
						submitAction={handleSubmit}
					/>
				</ModalWrapper>
			)}

			<Button
				variant="secondary"
				className="pl-4 pr-6"
				onClick={() => setOpen(true)}
			>
				<PlusIcon />
				Add Single
			</Button>
		</>
	);
}
