import { signOut } from "next-auth/react";
import { $Enums } from "@prisma/client";
import { MenuItem } from "./types";
import { Home, Lock, LogOut, Mic, Settings, Star, User } from "lucide-react";

export function getMainMenuItems(role: $Enums.Role): MenuItem[] {
	const items: MenuItem[] = [
		{
			id: "home",
			label: "Home",
			icon: Home,
			href: "/",
		},
		{
			id: "library",
			label: "My Library",
			icon: Star,
			href: "/library",
		},
	];

	if (role === "ADMIN") {
		items.push({
			id: "admin",
			label: "Admin",
			icon: Lock,
			children: [
				{
					id: "artists",
					label: "Artists",
					icon: Mic,
					href: "/admin/artist",
				},
				{
					id: "users",
					label: "Users",
					icon: User,
					href: "/admin/user",
				},
			],
		});
	}

	return items;
}

export function getFooterMenuItems(): MenuItem[] {
	return [
		{
			id: "settings",
			label: "Settings",
			icon: Settings,
			href: "/settings",
		},
		{
			id: "signout",
			label: "Sign Out",
			icon: LogOut,
			action: () => signOut(),
		},
	];
}
