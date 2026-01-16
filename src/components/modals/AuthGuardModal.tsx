"use client";

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
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

type AuthGuardModalProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	callbackUrl: string;
};

export function AuthGuardModal({
	isOpen,
	onOpenChange,
	callbackUrl,
}: AuthGuardModalProps) {
	const router = useRouter();

	const handleSignIn = () => {
		router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
		onOpenChange(false);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-center gap-2">
						<Lock className="h-5 w-5 text-muted-foreground" />
						<AlertDialogTitle>Unlock Full Features</AlertDialogTitle>
					</div>
					<AlertDialogDescription>
						Sign in to create, save, and share your personalized rankings.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleSignIn}>
						Sign In / Sign Up
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
