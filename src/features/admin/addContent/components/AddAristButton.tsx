"use client";

import ModalWrapper from "@/components/modals/ModalWrapper";
import ArtistAddWizard from "./ArtistAddWizard";
import { useState } from "react";

import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "../../ui/button";

export function AddArtistButton() {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			<ModalWrapper
				onRequestClose={() => setOpen(false)}
				isRequestOpen={isOpen}
			>
				<ArtistAddWizard />
			</ModalWrapper>

			<Button
				variant="secondary"
				className="pl-4 pr-6"
				onClick={() => setOpen(true)}
			>
				<PlusIcon />
				Add Artist
			</Button>
		</>
	);
}
