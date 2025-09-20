"use client";

import { useRef } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	//SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarProps } from "./types";
import {
	getMainMenuItems,
	getFooterMenuItems,
	getRecentArtists,
} from "./config";
import { MenuSection } from "./sections/MenuSection";
import { ArtistSection } from "./sections/ArtistSection";
import { UserSection } from "./sections/UserSection";

export function SimpleSidebar({ user, artists }: SidebarProps) {
	const sidebarRef = useRef<HTMLDivElement>(null);
	const mainItems = getMainMenuItems(user.role);
	const footerItems = getFooterMenuItems();
	const recentArtists = getRecentArtists(artists);

	return (
		<Sidebar
			ref={sidebarRef}
			collapsible="icon"
			variant="sidebar"
			className="overflow-hidden"
		>
			<SidebarHeader className="border-b border-sidebar-border">
				<div className="flex items-center justify-start p-3">
					<SidebarTrigger className="h-8 w-8" />
				</div>
			</SidebarHeader>

			<div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
				<SidebarContent className="!overflow-visible">
					<SidebarGroup>
						<MenuSection items={mainItems} />
					</SidebarGroup>
					<ArtistSection artists={recentArtists} />
				</SidebarContent>
			</div>

			<UserSection user={user} footerItems={footerItems} />
			{/* <SidebarRail/> */}
		</Sidebar>
	);
}
