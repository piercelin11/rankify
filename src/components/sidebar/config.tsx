import {
  HomeIcon,
  GearIcon,
  LockClosedIcon,
  StarIcon,
  AvatarIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { $Enums } from "@prisma/client";
import { MenuItem } from "./types";
import { ArtistData } from "@/types/data";

const ICON_SIZE = 20;

export function getMainMenuItems(role: $Enums.Role): MenuItem[] {
  const items: MenuItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <HomeIcon width={ICON_SIZE} height={ICON_SIZE} />,
      href: "/",
    },
    {
      id: "library",
      label: "My Library",
      icon: <StarIcon width={ICON_SIZE} height={ICON_SIZE} />,
      href: "/library",
    },
  ];

  if (role === "ADMIN") {
    items.push({
      id: "admin",
      label: "Admin",
      icon: <LockClosedIcon width={ICON_SIZE} height={ICON_SIZE} />,
      children: [
        {
          id: "artists",
          label: "Artists",
          icon: <StarIcon width={ICON_SIZE} height={ICON_SIZE} />,
          href: "/admin/artist",
        },
        {
          id: "users",
          label: "Users",
          icon: <AvatarIcon width={ICON_SIZE} height={ICON_SIZE} />,
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
      icon: <GearIcon width={ICON_SIZE} height={ICON_SIZE} />,
      href: "/settings",
    },
    {
      id: "signout",
      label: "Sign Out",
      icon: <ExitIcon width={ICON_SIZE} height={ICON_SIZE} />,
      action: () => signOut(),
    },
  ];
}

export function getRecentArtists(artists: ArtistData[]): ArtistData[] {
  return artists.slice(0, 3);
}