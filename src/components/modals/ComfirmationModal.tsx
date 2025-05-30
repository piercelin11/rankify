"use client";

import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import Button from "../buttons/Button";
import dynamic from "next/dynamic";

const ModalWrapper = dynamic(() => import("./ModalWrapper"), { ssr: false });

type ComfirmationModalProps = {
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
		<>
			<ModalWrapper
				onRequestClose={() => setOpen(false)}
				isRequestOpen={isOpen}
			>
				<div className="flex flex-col items-center p-8">
					<h2 className="mb-8">{title}</h2>
					<div className="mb-14 space-y-2">
						<p className="text-center">{description}</p>
						<p className="text-center font-semibold text-neutral-100">
							{warning}
						</p>
					</div>

					<div className="flex gap-4">
						<Button variant="outline" onClick={onCancel}>
							{cancelLabel}
						</Button>
						<Button variant="primary" onClick={onConfirm}>
							{comfirmLabel}
						</Button>
					</div>
				</div>
			</ModalWrapper>
		</>
	);
}
