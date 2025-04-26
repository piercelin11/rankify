"use client";

import {
	adminSidebarMenuItem,
} from "@/config/sidebarMenu";
import React from "react";
import SidebarMenuItem from "./SidebarMenuItem";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/sidebarSlice";
import { ExtendedUser } from "@/types/auth";
import UserProfile from "./UserProfile";

type MainSidebarProps = {
	userSession: ExtendedUser;
};

export default function AdminSidebar({ userSession }: MainSidebarProps) {
	const dispatch = useAppDispatch();

	return (
		<div className="flex h-full flex-col">
			<div className="m-2 px-2">
				<button
					className="rounded-full p-4 hover:bg-neutral-900"
					onClick={() => dispatch(toggleSidebar())}
				>
					<HamburgerMenuIcon width={20} height={20} />
				</button>
			</div>

			<div className="m-2 space-y-2">
				{adminSidebarMenuItem.map((item) => (
					<SidebarMenuItem
						key={item.id}
						icon={item.icon}
						href={item.href}
						label={item.label}
					/>
				))}
			</div>
            <div className="mt-auto p-2">
			<UserProfile userSession={userSession} />
            </div>
		</div>
	);
}
