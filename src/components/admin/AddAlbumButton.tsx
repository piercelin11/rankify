"use client";

import React, { useState } from "react";
import ModalWrapper from "../modal/ModalWrapper";
import { AddButton } from "../ui/Button";
import AlbumSelectSection from "./AlbumSelectSection";
import { AlbumData } from "@/types/data";

type AddAlbumButtonProps = {
	artistId: string;
	savedAlbums: AlbumData[];
};

export default function AddAlbumButton({
	artistId,
	savedAlbums,
}: AddAlbumButtonProps) {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<AlbumSelectSection
						artistId={artistId}
						handleCancel={() => setOpen(false)}
						savedAlbums={savedAlbums}
					/>
				</ModalWrapper>
			)}
			<AddButton variant="gray" onClick={() => setOpen(true)} />
		</>
	);
}
