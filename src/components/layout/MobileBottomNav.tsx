"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtendedUser } from "@/types/auth.d";

type NavItem = {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	href: string;
	isActive: (pathname: string) => boolean;
};

export function MobileBottomNav({ user }: { user: ExtendedUser | null }) {
	const pathname = usePathname();
	const router = useRouter();

	const navItems: NavItem[] = [
		{
			icon: Home,
			label: "Home",
			href: "/",
			isActive: (path) => path === "/",
		},
		{
			icon: Search,
			label: "Search",
			href: "/search",
			isActive: (path) => path === "/search",
		},
		{
			icon: User,
			label: user ? "Profile" : "Login",
			href: user ? "/settings" : "/auth/signin",
			isActive: (path) => path.startsWith("/settings"),
		},
	];

	const handleNavClick = (item: NavItem) => {
		router.push(item.href);
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
			<div className="flex h-header items-center justify-around">
				{navItems.map((item) => {
					const isActive = item.isActive(pathname);
					const Icon = item.icon;

					return (
						<button
							key={item.label}
							onClick={() => handleNavClick(item)}
							className={cn(
								"flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Icon className={cn("h-5 w-5", isActive && "fill-current")} />
							<span>{item.label}</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
