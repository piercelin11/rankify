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