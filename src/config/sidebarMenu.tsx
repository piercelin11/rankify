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

const iconSize = 20;

export const getMainSidebarMenuItems = (
	role: $Enums.Role
): SidebarMenuItemType[] => {
	const sidebarItems = [
		{
			id: "home",
			label: "Home",
			icon: () => <HomeIcon width={iconSize} height={iconSize} />,
			href: "/",
		},
		{
			id: "settings",
			label: "Settings",
			icon: () => <GearIcon width={iconSize} height={iconSize} />,
			href: "/settings",
		},
	];
	if (role === "ADMIN")
		sidebarItems.push({
			id: "admin",
			label: "Admin",
			icon: () => <LockClosedIcon width={iconSize} height={iconSize} />,
			href: "/admin/artist",
		});
	return [
		...sidebarItems,
		{
			id: "signout",
			label: "Sign Out",
			icon: () => <ExitIcon width={iconSize} height={iconSize} />,
			onClick: () => {
				console.log("hi")
				signOut()
			},
		},
	];
};

export const adminSidebarMenuItems: SidebarMenuItemType[] = [
	{
		id: "home",
		label: "Home",
		icon: () => <HomeIcon width={iconSize} height={iconSize} />,
		href: "/",
	},
	{
		id: "artists",
		label: "Artists",
		icon: () => <StarIcon width={iconSize} height={iconSize} />,
		href: "/admin/artist",
	},
	{
		id: "users",
		label: "Users",
		icon: () => <AvatarIcon width={iconSize} height={iconSize} />,
		href: "/admin/user",
	},
	{
		id: "settings",
		label: "Settings",
		icon: () => <GearIcon width={iconSize} height={iconSize} />,
		href: "/admin/setting",
	},
];

export const settingsSidebarMenuItems: Omit<SidebarMenuItemType, "icon">[] = [
	{
		id: "profile",
		label: "Profile",
		href: "/settings",
	},
	{
		id: "ranking",
		label: "Ranking",
		href: "/settings/ranking",
	},
	{
		id: "notifications",
		label: "Notifications",
		href: "/settings/notification",
	},
];
