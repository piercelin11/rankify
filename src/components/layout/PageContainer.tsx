"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageContainerProps {
	children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
	const pathname = usePathname();

	const shouldRemovePadding = pathname.includes("/ranking");

	return (
		<div className={cn(shouldRemovePadding ? "" : "p-content")}>{children}</div>
	);
}
