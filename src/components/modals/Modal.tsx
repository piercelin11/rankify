"use client";

import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type ModalProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
	sm: "max-w-sm",
	md: "max-w-md", 
	lg: "max-w-lg",
	xl: "max-w-xl",
};

export function Modal({
	isOpen,
	onOpenChange,
	title,
	description,
	children,
	footer,
	className,
	size = "lg",
}: ModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className={`${sizeClasses[size]} ${className || ""}`}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description || ""}</DialogDescription>
				</DialogHeader>
				<hr />
				<div className="overflow-hidden">{children}</div>
				{footer && <DialogFooter>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
}