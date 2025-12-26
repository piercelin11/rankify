"use client";

import { useRef } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
} from "@/components/ui/sidebar";
import { SidebarProps } from "./types";
import {
	getMainMenuItems,
	getFooterMenuItems
} from "./config";
import { MenuSection } from "./sections/MenuSection";
import { ArtistSection } from "./sections/ArtistSection";
import { UserSection } from "./sections/UserSection";

export function SimpleSidebar({ user, artists }: SidebarProps) {
	const sidebarRef = useRef<HTMLDivElement>(null);
	const mainItems = getMainMenuItems(user.role);
	const footerItems = getFooterMenuItems();
	const recentArtists = artists.slice(0, 3);;

	return (
		<Sidebar
			ref={sidebarRef}
			collapsible="icon"
			variant="inset"
			className="overflow-y-auto overscroll-y-contain bg-background"
		>
			<SidebarContent>
				<SidebarGroup>
					<MenuSection items={mainItems} />
				</SidebarGroup>
				<ArtistSection artists={recentArtists} />
			</SidebarContent>

			<UserSection user={user} footerItems={footerItems} />
		</Sidebar>
	);
}
