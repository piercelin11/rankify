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
						<AlertDialogTitle>解鎖完整功能</AlertDialogTitle>
					</div>
					<AlertDialogDescription>
						登入後即可建立、儲存並分享你的專屬排名。
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>取消</AlertDialogCancel>
					<AlertDialogAction onClick={handleSignIn}>
						前往登入/註冊
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
