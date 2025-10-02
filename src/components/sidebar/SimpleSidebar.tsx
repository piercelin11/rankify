"use client";

import { useRef } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarTrigger,
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
			variant="sidebar"
			className="overflow-y-auto overscroll-y-contain"
		>
			<SidebarHeader className="border-b border-sidebar-border">
				<div className="flex items-center justify-start p-3">
					<SidebarTrigger className="h-8 w-8" />
				</div>
			</SidebarHeader>

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
