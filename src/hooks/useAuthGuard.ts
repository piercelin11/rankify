"use client";

import { useModal } from "@/contexts";
import { usePathname } from "next/navigation";

export function useAuthGuard() {
	const { showAuthGuard } = useModal();
	const pathname = usePathname();

	const requireAuth = () => {
		const callbackUrl = pathname;
		showAuthGuard({ callbackUrl });
	};

	return { requireAuth };
}
