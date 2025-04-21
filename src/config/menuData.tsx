import { ReactNode } from "react";
import {
	AvatarIcon,
	GearIcon,
	HomeIcon,
	StarIcon,
} from "@radix-ui/react-icons";

type MenuItem = {
	name: string;
	icon: () => ReactNode;
	link: string;
};

export const adminMenuData: MenuItem[] = [
	{
		name: "Artists",
		icon: () => <StarIcon />,
		link: "/admin/artist",
	},
	{
		name: "Users",
		icon: () => <AvatarIcon />,
		link: "/admin/user",
	},
	{
		name: "Settings",
		icon: () => <GearIcon />,
		link: "/admin/setting",
	},
];

export const mainMenuData: MenuItem[] = [
	{
		name: "Home",
		icon: () => <HomeIcon />,
		link: "/",
	},
	{
		name: "Settings",
		icon: () => <GearIcon />,
		link: "/settings",
	},
];

export const settingsMenuData: Omit<MenuItem, "icon">[] = [
	{
		name: "Profile",
		link: "/settings/profile",
	},
	{
		name: "Ranking",
		link: "/settings/ranking",
	},
	{
		name: "Notifications",
		link: "/settings/notification",
	},
];

export const getNavMenuData = (artistId: string) => [
	{
		id:"overview",
		label: "My Overview",
		href: `/artist/${artistId}/overview`,
	},
	{
		id:"history",
		label: "Ranking History",
		href: `/artist/${artistId}/history`,
	},
];

export const dropdownMenuData =
 [
	{	id: "pastmonth",
		label: "past month", 
		query: { months: "1" },href: `?${new URLSearchParams({ months: "1" })}`,
	},
	{
		id: "past6months",
		label: "past 6 months",
		query: { months: "6" },
		href: `?${new URLSearchParams({ months: "6" })}`,
	},
	{
		id: "pastyear",
		label: "past year",
		query: { years: "1" },
		href: `?${new URLSearchParams({ years: "1" })}`,
	},
	{
		id: "past2year",
		label: "past 2 years",
		query: { years: "2" },
		href: `?${new URLSearchParams({ years: "2" })}`,
	},
	{
		id: "lifetime",
		label: "lifetime",
		query: {},
		href: `?${new URLSearchParams()}`,
	},
];
