"use client";

import React, { useState } from "react";
import ModalWrapper, { ModalWrapperProps } from "./ModalWrapper";
import Button, { ButtonProps } from "../ui/Button";

type ModalOpenButtonProps = {
	children: [
		React.ReactNode,
		React.ReactNode,
	];
	submitButton?: boolean,
} & ButtonProps &
	Omit<ModalWrapperProps, "setOpen">;

export default function ModalOpenButton({
	children,
	variant,
	rounded,
	title,
	description,
	className,
}: ModalOpenButtonProps) {
	const [isOpen, setOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<ModalWrapper setOpen={setOpen} title={title} description={description}>
					{children[0]}
				</ModalWrapper>
			)}

			<Button
				variant={variant}
				onClick={() => setOpen(true)}
				className={className}
				rounded={rounded}
			>
				{children[1]}
			</Button>
		</>
	);
}
