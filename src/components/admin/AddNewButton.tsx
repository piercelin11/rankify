"use client";

import React, { useState } from "react";
import ModalWrapper from "../modal/ModalWrapper";
import Button, { AddButton } from "../ui/Button";
import SelectItemForm from "./SelectItemForm";
import { PlusIcon } from "@radix-ui/react-icons";

type AddNewButtonProps = {
	artistId: string;
	type: "Album" | "EP" | "Single";
	buttonLabel?: string;
};

export default function AddNewButton({
	artistId,
	type,
	buttonLabel,
}: AddNewButtonProps) {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<SelectItemForm
						artistId={artistId}
						handleCancel={() => setOpen(false)}
						type={type}
					/>
				</ModalWrapper>
			)}

			{buttonLabel ? (
				<Button
					variant="gray"
					className="pl-4 pr-5"
					onClick={() => setOpen(true)}
				>
					<PlusIcon />
					{buttonLabel}
				</Button>
			) : (
				<AddButton variant="gray" onClick={() => setOpen(true)} />
			)}
		</>
	);
}
