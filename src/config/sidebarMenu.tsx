import { $Enums } from "@prisma/client";
import {
	AvatarIcon,
	ExitIcon,
	GearIcon,
	HomeIcon,
	LockClosedIcon,
	StarIcon,
} from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";

type SidebarMenuItemType = {
	id: string;
	icon: () => React.ReactNode;
	onClick?: () => void;
	href?: string;
	label: string;
};

export const getMainSidebarMenuItems = (
	role: $Enums.Role
): SidebarMenuItemType[] => {
	const sidebarItems = [
		{
			id: "home",
			label: "Home",
			icon: () => <HomeIcon width={20} height={20} />,
			href: "/",
		},
		{
			id: "settings",
			label: "Settings",
			icon: () => <GearIcon width={20} height={20} />,
			href: "/settings",
		},
	];
	if (role === "ADMIN")
		sidebarItems.push({
			id: "admin",
			label: "Admin",
			icon: () => <LockClosedIcon width={20} height={20} />,
			href: "/admin",
		});
	return [
		...sidebarItems,
		{
			id: "signout",
			label: "Sign Out",
			icon: () => <ExitIcon width={20} height={20} />,
			onClick: () => signOut(),
		},
	];
};

export const adminSidebarMenuItem: SidebarMenuItemType[] = [
	{
		id: "artists",
		label: "Artists",
		icon: () => <StarIcon />,
		href: "/admin/artist",
	},
	{
		id: "users",
		label: "Users",
		icon: () => <AvatarIcon />,
		href: "/admin/user",
	},
	{
		id: "settings",
		label: "Settings",
		icon: () => <GearIcon />,
		href: "/admin/setting",
	},
];
