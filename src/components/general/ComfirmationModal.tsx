"use client";

import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Button from "../ui/Button";

type ComfirmationModalProps = {
	children: ReactNode;
	onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    comfirmLabel?: string;
    cancelLabel?: string;
	title?: string;
	description?: string;
	warning?: string;
};

export default function ComfirmationModal({
	children,
	onConfirm,
    onCancel,
    isOpen,
    setOpen,
    comfirmLabel = "Comfirm",
    cancelLabel = "Cancel",
	title,
	description,
	warning,
}: ComfirmationModalProps) {

	return (
		<div>
			{children}
			{isOpen && (
				<ModalWrapper setOpen={setOpen}>
					<div className="flex flex-col items-center p-8">
						<h2 className="mb-8">{title}</h2>
						<div className="mb-14 space-y-2">
							<p className="text-center">{description}</p>
							<p className="font-semibold text-zinc-100 text-center">{warning}</p>
						</div>

						<div className="flex gap-4">
							<Button variant="outline" onClick={onCancel}>
								{cancelLabel}
							</Button>
							<Button variant="lime" onClick={onConfirm}>
								{comfirmLabel}
							</Button>
						</div>
					</div>
				</ModalWrapper>
			)}
		</div>
	);
}
