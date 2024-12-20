import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";
import { Description } from "../ui/Text";

export type ModalWrapperProps = {
	children: React.ReactNode;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	title?: string;
	description?: string;
};

export default function ModalWrapper({
	children,
	setOpen,
	title,
	description,
}: ModalWrapperProps) {
	return (
		<div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center">
			<div className={`relative z-10 w-[680px] rounded-lg border border-zinc-700 bg-zinc-900/70 p-8`}>
				<Cross2Icon
					className="absolute right-8 top-8 cursor-pointer text-zinc-500"
					onClick={() => setOpen(false)}
					width={20}
					height={20}
				/>
				<div className="space-y-8">
					{(title || description) && (
						<div className="w-11/12 space-y-2">
							<h2>{title}</h2>
							<Description>{description}</Description>
						</div>
					)}
					{children}
				</div>
			</div>
			<div className="fixed h-full w-full bg-zinc-950/70"></div>
		</div>
	);
}
