"use client"

import ModalWrapper from "@/components/general/ModalWrapper";
import ArtistAddWizard from "./ArtistAddWizard";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@radix-ui/react-icons";

export function AddArtistButton() {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<ArtistAddWizard />
				</ModalWrapper>
			)}

			<Button
				variant="gray"
				className="pl-4 pr-6"
				onClick={() => setOpen(true)}
			>
				<PlusIcon />
				Add Artist
			</Button>
		</>
	);
}