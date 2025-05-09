"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Button from "../buttons/Button";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import useMediaQuery from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";

type SidebarLayoutProps = {
	children: [React.ReactNode, React.ReactNode];
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
	const isMobile = useMediaQuery("max", 1024);
	const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
	return (
		<>
			{isMobile && <MobileSidebarLayout>{children[0]}</MobileSidebarLayout>}

			<aside
				className={cn(
					"fixed z-10 hidden h-screen border-r border-neutral-800 transition-all duration-200 ease-in-out sm:block sm:w-sidebar-lg",
					{
						"sm:w-sidebar-sm": !isSidebarOpen,
					}
				)}
			>
				{children[0]}
			</aside>
			<main
				className={cn(
					"main-content relative h-screen overflow-auto pl-0 transition-all duration-200 ease-in-out scrollbar-hidden sm:pl-sidebar-lg",
					{
						"sm:pl-sidebar-sm": !isSidebarOpen,
					}
				)}
			>
				{children[1]}
			</main>
		</>
	);
}

export function SettingsSidebarLayout({ children }: SidebarLayoutProps) {
	return (
		<div className="h-screen">
			<aside className="fixed h-screen w-[80px] md:w-[300px] 2xl:w-[350px]">
				{children[0]}
			</aside>
			<main className="pl-[80px] md:pl-[300px] 2xl:pl-[350px]">
				{children[1]}
			</main>
		</div>
	);
}

function MobileSidebarLayout({ children }: { children: ReactNode }) {
	const [isOpen, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<>
			<Button
				variant="ghost"
				className="fixed right-4 top-4 z-10 sm:hidden"
				onClick={() => setOpen(true)}
			>
				<HamburgerMenuIcon />
			</Button>
			{isOpen && (
				<aside className="fixed z-50 h-screen w-screen bg-neutral-950 pt-10 sm:hidden">
					<Button
						variant="ghost"
						className="fixed right-4 top-4"
						onClick={() => setOpen(false)}
					>
						<Cross1Icon />
					</Button>
					<div className="mx-auto w-[300px]">{children}</div>
				</aside>
			)}
		</>
	);
}
