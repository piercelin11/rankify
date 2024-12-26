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
    }
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
		link: "/setting",
    }
];

export const getNavMenuData = (artistId: string) => [
	/* {
		label: "Global Trend",
		link: `/artist/${artistId}/trend`,
	}, */
	{
		label: "My Overview",
		link: `/artist/${artistId}/overview`,
	},
	{
		label: "Ranking History",
		link: `/artist/${artistId}/history`,
	},
];

export const dropdownMenuData = [
	{
		label: "past month",
		link: `?${new URLSearchParams({ months: "1" })}`,
	},
	{
		label: "6 months",
		link: `?${new URLSearchParams({ months: "6" })}`,
	},
	{
		label: "past year",
		link: `?${new URLSearchParams({ years: "1" })}`,
	},
	{
		label: "past 2 years",
		link: `?${new URLSearchParams({ years: "2" })}`,
	},
	{
		label: "lifetime",
		link: `?${new URLSearchParams()}`,
	},
];