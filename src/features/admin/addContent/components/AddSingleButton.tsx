"use client";

import ModalWrapper from "@/components/modals/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import { Button } from "../../ui/button";import { PlusIcon } from "@radix-ui/react-icons";
import addSingle from "@/features/admin/addContent/actions/addSingle";

type AddSingleButtonProps = {
	artistId: string;
};

export default function AddSingleButton({ artistId }: AddSingleButtonProps) {
	const [isOpen, setOpen] = useState(false);

	function handleSubmit(singleIds: string[], token: string) {
		return addSingle({artistId, trackIds: singleIds, token});
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
