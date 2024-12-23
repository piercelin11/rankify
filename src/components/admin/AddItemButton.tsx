"use client";

import React, { useState } from "react";
import ModalWrapper from "../modal/ModalWrapper";
import Button, { AddButton } from "../ui/Button";
import SelectSection from "./SelectSection";
import { PlusIcon } from "@radix-ui/react-icons";

type AddItemButtonProps = {
	artistId: string;
	type: "Album" | "EP" | "Single";
	buttonLabel?: string;
};

export default function AddItemButton({
	artistId,
	type,
	buttonLabel,
}: AddItemButtonProps) {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<SelectSection
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
