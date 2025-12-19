"use client";

import { useRef } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { MenuSection } from "./sections/MenuSection";
import { getMainMenuItems } from "./config";

export function GuestSidebar() {
	const sidebarRef = useRef<HTMLDivElement>(null);
	const mainItems = getMainMenuItems()

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
			</SidebarContent>

		</Sidebar>
	);
}
