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
			<div className="flex h-16 items-center gap-4 px-4">
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

				{/* 中間: 搜尋 (Desktop only) */}
				<div className="hidden flex-1 md:flex md:max-w-md lg:max-w-lg">
					<GlobalSearch />
				</div>

				{/* 右側: 認證區 */}
				<AuthSection user={user} />
			</div>
		</header>
	);
}
