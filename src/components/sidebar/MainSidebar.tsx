"use client";

import { getMainSidebarMenuItems } from "@/config/sidebarMenu.config";
import React from "react";
import SidebarMenuItem from "./SidebarMenuItem";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { ArtistData } from "@/types/data";
import SidebarArtistItem from "./SidebarArtistItem";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/sidebarSlice";
import { ExtendedUser } from "@/types/auth";
import UserProfile from "./UserProfile";

type MainSidebarProps = {
	userSession: ExtendedUser;
	artistData: ArtistData[];
};

export default function MainSidebar({
	userSession,
	artistData,
}: MainSidebarProps) {
	const mainSidebarMenuItems = getMainSidebarMenuItems(userSession.role);
	
	const dispatch = useAppDispatch();

	return (
		<div className="flex h-full flex-col [&>div]:m-2">
			<div className="mb-4 px-2">
				<button
					className="rounded-full p-4 hover:bg-neutral-900"
					onClick={() => dispatch(toggleSidebar())}
				>
					<HamburgerMenuIcon width={20} height={20} />
				</button>
			</div>
			
			<div>
				{mainSidebarMenuItems.map((item) => (
					<SidebarMenuItem
						key={item.id}
						icon={item.icon}
						href={item.href}
						label={item.label}
					/>
				))}
			</div>
			<div className="px-4">
				<hr />
			</div>
			<div className="flex-1 overflow-auto overscroll-contain py-2 scrollbar-hidden">
				{artistData.map((artist) => (
					<SidebarArtistItem key={artist.id} artistData={artist} />
				))}
			</div>
            <UserProfile userSession={userSession} />
		</div>
	);
}
