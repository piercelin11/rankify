"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarProps } from "./types";
import { getMainMenuItems, getFooterMenuItems, getRecentArtists } from "./config";
import { MenuSection } from "./sections/MenuSection";
import { ArtistSection } from "./sections/ArtistSection";
import { UserSection } from "./sections/UserSection";

export function SimpleSidebar({ user, artists }: SidebarProps) {
  const mainItems = getMainMenuItems(user.role);
  const footerItems = getFooterMenuItems();
  const recentArtists = getRecentArtists(artists);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-start p-2">
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
      <SidebarRail />
    </Sidebar>
  );
}