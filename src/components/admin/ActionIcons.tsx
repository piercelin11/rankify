"use client";

import React, { ReactNode, useState } from "react";
import { Pencil1Icon, TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import deleteItem from "@/lib/action/admin/deleteItem";
import ModalWrapper from "../modal/ModalWrapper";
import { AlbumData, ArtistData } from "@/types/data";
import EditAlbumForm from "./AlbumEditingForm";
import updateInfo from "@/lib/action/admin/updateInfo";
import { cn } from "@/lib/cn";
import Button from "../ui/Button";
import { Description } from "../ui/Text";

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

	return (
		<div
			className={cn("flex gap-6", {
				"justify-end": type === "artist",
			})}
		>
			<UpdateIcon {...svgAttributes} onClick={() => updateInfo(type, id)} />
			<Pencil1Icon {...svgAttributes} onClick={() => setOpen(true)} />
			<TrashIcon onClick={() => setComfirmationOpen(true)} {...svgAttributes} />

			{isOpen && (
				<ModalWrapper setOpen={setOpen}>{children(setOpen)}</ModalWrapper>
			)}

			{isComfirmationOpen && (
				<ModalWrapper setOpen={setComfirmationOpen}>
					<div className="flex flex-col items-center p-8">
						<h2 className="mb-8">Are You Sure?</h2>
						<div className="mb-14 space-y-2">
							<p className="text-center">This action cannot be undone.</p>
							<p className="font-semibold text-zinc-100">
								Warning: All associated data will also be removed.
							</p>
						</div>

						<div className="flex gap-4">
							<Button
								variant="transparent"
								onClick={() => setComfirmationOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="lime"
								onClick={() => deleteItem(type, id)}
							>
								Delete
							</Button>
						</div>
					</div>
				</ModalWrapper>
			)}
		</div>
	);
}
