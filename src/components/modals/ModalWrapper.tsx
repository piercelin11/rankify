import { cn } from "@/lib/cn";
import { Cross2Icon } from "@radix-ui/react-icons";
import React, { HTMLAttributes } from "react";

export type ModalWrapperProps = {
	children: React.ReactNode;
	onRequestClose: () => void;
	isRequestOpen: boolean;
	className?: HTMLAttributes<HTMLDivElement>["className"];
};

export default function ModalWrapper({
	children,
	onRequestClose,
	isRequestOpen,
	className,
}: ModalWrapperProps) {
	return (
		<>
			{isRequestOpen && (
				<div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center p-4">
					<div
						className={cn(
							"relative z-50 w-[680px] rounded-2xl border border-neutral-700 bg-neutral-950 p-8 sm:p-12",
							className
						)}
					>
						<Cross2Icon
							className="absolute right-4 top-4 cursor-pointer text-neutral-500 hover:text-neutral-100"
							onClick={onRequestClose}
							width={20}
							height={20}
						/>
						<div className="space-y-8">{children}</div>
					</div>
					<div className="fixed h-full w-full bg-neutral-950/70"></div>
				</div>
			)}
		</>
	);
}
