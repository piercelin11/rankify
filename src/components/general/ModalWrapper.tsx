import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";
import { Description } from "../ui/Text";

export type ModalWrapperProps = {
	children: React.ReactNode;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ModalWrapper({
	children,
	setOpen,
}: ModalWrapperProps) {
	return (
		<div className="fixed z-50 left-0 top-0 flex h-screen w-screen items-center justify-center p-4">
			<div className={`relative z-50 w-[680px] rounded-lg border border-zinc-700 bg-zinc-950 p-4 sm:p-8`}>
				<Cross2Icon
					className="absolute right-4 top-4 cursor-pointer text-zinc-500"
					onClick={() => setOpen(false)}
					width={20}
					height={20}
				/>
				<div className="space-y-8">
					{children}
				</div>
			</div>
			<div className="fixed h-full w-full bg-zinc-950/70"></div>
		</div>
	);
}
