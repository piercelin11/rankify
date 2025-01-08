"use client";

import React, { ReactNode, useState } from "react";
import { Pencil1Icon, TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import deleteItem from "@/lib/action/admin/deleteItem";
import ModalWrapper from "../general/ModalWrapper";
import { AlbumData, ArtistData } from "@/types/data";
import updateInfo from "@/lib/action/admin/updateInfo";
import { cn } from "@/lib/cn";
import Button from "../ui/Button";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import ComfirmationModal from "../general/ComfirmationModal";

const svgAttributes = {
	className: "text-zinc-400 hover:text-zinc-100",
	width: 25,
	height: 25,
};

type ActionIconsProps = {
	data: AlbumData | ArtistData;
	type: "album" | "artist";
	children: (
		setOpen: React.Dispatch<React.SetStateAction<boolean>>
	) => ReactNode;
};

export default function ActionIcons({
	data,
	type,
	children,
}: ActionIconsProps) {
	const [isOpen, setOpen] = useState(false);
	const [isComfirmationOpen, setComfirmationOpen] = useState(false);

	const { id } = data;

	async function handleUpdate() {
		const accessToken = await fetchSpotifyToken();
		updateInfo(type, id, accessToken);
	}

	return (
		<div
			className={cn("flex gap-6", {
				"justify-end": type === "artist",
			})}
		>
			<UpdateIcon {...svgAttributes} onClick={handleUpdate} />
			<Pencil1Icon {...svgAttributes} onClick={() => setOpen(true)} />
			<ComfirmationModal
				onConfirm={() => deleteItem(type, id)}
				onCancel={() => setComfirmationOpen(false)}
				comfirmLabel="Delete"
				cancelLabel="Cancel"
				isOpen={isComfirmationOpen}
				setOpen={setComfirmationOpen}
				title="Are You Sure?"
				description="This action cannot be undone."
				warning="Warning: All associated data will also be removed."
			>
				<TrashIcon
					onClick={() => setComfirmationOpen(true)}
					{...svgAttributes}
				/>
			</ComfirmationModal>

			{isOpen && (
				<ModalWrapper setOpen={setOpen}>{children(setOpen)}</ModalWrapper>
			)}
		</div>
	);
}
