"use client";

import ArtistAddWizard from "./ArtistAddWizard";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts";

export function AddArtistButton() {
	const { showCustom } = useModal();

	return (
		<>
			<Button
				variant="secondary"
				className="pl-4 pr-6"
				onClick={() =>
					showCustom({ title: "Add Artist", content: <ArtistAddWizard /> })
				}
			>
				<PlusIcon />
				Add Artist
			</Button>
		</>
	);
}
