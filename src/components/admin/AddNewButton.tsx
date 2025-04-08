"use client";

import React, { useState } from "react";
import Button, { AddButton } from "../ui/Button";
import SelectItemForm from "./SelectItemForm";
import { PlusIcon } from "@radix-ui/react-icons";
import ArtistAddingModal from "./ArtistAddingModal";
import dynamic from "next/dynamic";

const ModalWrapper = dynamic(() => import("../general/ModalWrapper"), { ssr: false });


type AddNewButtonProps =
{
	artistId: string;
	type: "Album" | "EP" | "Single";
	buttonLabel?: string;
}

export default function AddNewButton(props: AddNewButtonProps) {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<SelectItemForm
							artistId={props.artistId}
							handleCancel={() => setOpen(false)}
							type={props.type}
						/>
				</ModalWrapper>
			)}

			{props.buttonLabel ? (
				<Button
					variant="gray"
					className="pl-4 pr-6"
					onClick={() => setOpen(true)}
				>
					<PlusIcon />
					{props.buttonLabel}
				</Button>
			) : (
				<AddButton variant="gray" onClick={() => setOpen(true)} />
			)}
		</>
	);
}

export function AddArtistButton() {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<ArtistAddingModal />
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
