"use client";

import React, { ReactNode, useState } from "react";
import ModalWrapper from "../modal/ModalWrapper";
import Button, { AddButton } from "../ui/Button";
import SelectItemForm from "./SelectItemForm";
import { PlusIcon } from "@radix-ui/react-icons";

type AddNewButtonProps =
| {
	kind: "default";
	artistId: string;
	type: "Album" | "EP" | "Single";
	buttonLabel?: string;
}
| {
	kind: "custom";
	buttonLabel: string;
	children: ReactNode;
};

export default function AddNewButton(props: AddNewButtonProps) {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					{props.kind === "custom" ? (
						props.children
					) : (
						<SelectItemForm
							artistId={props.artistId}
							handleCancel={() => setOpen(false)}
							type={props.type}
						/>
					)}
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
