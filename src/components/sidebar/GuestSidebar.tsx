"use client";

import { useRef } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
} from "@/components/ui/sidebar";
import { MenuSection } from "./sections/MenuSection";
import { getMainMenuItems } from "./config";

export function GuestSidebar() {
	const sidebarRef = useRef<HTMLDivElement>(null);
	const mainItems = getMainMenuItems();

	return (
		<Sidebar
			ref={sidebarRef}
			collapsible="icon"
			variant="sidebar"
			className="overflow-y-auto overscroll-y-contain"
		>
			<SidebarContent>
				<SidebarGroup>
					<MenuSection items={mainItems} />
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
