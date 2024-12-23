"use client";

import React, { useState } from "react";
import { Pencil1Icon, TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import deleteItem from "@/lib/action/admin/deleteItem";
import ModalWrapper from "../modal/ModalWrapper";
import { AlbumData } from "@/types/data";
import EditAlbumForm from "./EditAlbumForm";

const svgAttributes = {
	className: "text-zinc-400 hover:text-zinc-100",
	width: 22,
	height: 22,
};

type AlbumActionSectionProps = {
	data: AlbumData;
};

export default function AlbumActionSection({ data }: AlbumActionSectionProps) {
	const [isOpen, setOpen] = useState(false);

	const { id } = data;

	return (
		<div className="flex gap-6">
			<UpdateIcon {...svgAttributes} />
			<Pencil1Icon {...svgAttributes} onClick={() => setOpen(true)} />
			<TrashIcon onClick={() => deleteItem("album", id)} {...svgAttributes} />

			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<EditAlbumForm data={data} setOpen={setOpen} />
				</ModalWrapper>
			)}
		</div>
	);
}
