"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import GlobalSearch from "@/features/home/components/GlobalSearch";
import { AuthSection } from "./AuthSection";
import type { ExtendedUser } from "@/types/auth.d";

export function GlobalHeader({ user }: { user: ExtendedUser | null }) {
	const { toggleSidebar, isMobile } = useSidebar();

	return (
		<header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-header items-center justify-between px-4">
				{/* 左側: 漢堡按鈕 (Desktop only) + Logo */}
				<div className="flex items-center gap-3">
					{!isMobile && (
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleSidebar}
							className="h-9 w-9"
						>
							<Menu className="h-5 w-5" />
						</Button>
					)}
					<Link href="/" className="flex items-center gap-2">
						<span className="text-xl font-bold">Rankify</span>
					</Link>
				</div>

				{/* 中間: 搜尋 (Desktop only, 置中) */}
				<div className="absolute left-1/2 -translate-x-1/2 hidden md:flex w-full max-w-md lg:max-w-lg px-4">
					<GlobalSearch />
				</div>

				{/* 右側: 認證區 */}
				<div className="flex items-center">
					<AuthSection user={user} />
				</div>
			</div>
		</header>
	);
}
