"use client";

import * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AlertModalProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel?: () => void;
	variant?: "default" | "destructive";
	children?: React.ReactNode;
};

export function AlertModal({
	isOpen,
	onOpenChange,
	title,
	description,
	confirmText = "Comfirm",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	variant = "destructive",
	children,
}: AlertModalProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
		onOpenChange(false);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description && (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					)}
				</AlertDialogHeader>
				{children && <div className="py-4">{children}</div>}
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleCancel}>
						{cancelText}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className={
							variant === "destructive"
								? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
								: undefined
						}
					>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}