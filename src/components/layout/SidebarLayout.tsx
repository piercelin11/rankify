"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Button from "../buttons/Button";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import LogoDisplay from "../sidebar/LogoDisplay";
import { usePathname } from "next/navigation";
import useMediaQuery from "@/lib/hooks/useMediaQuery";

type SidebarLayoutProps = {
	children: [React.ReactNode, React.ReactNode];
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
	const isMobile = useMediaQuery("max", 1024);

	return (
		<>
			{isMobile && <MobileSidebarLayout>{children[0]}</MobileSidebarLayout>}

			<aside className="fixed z-10 hidden h-screen border-r border-neutral-800 pt-6 lg:block lg:w-[250px] xl:w-[300px]">
				<div className="px-4 py-5">
					<LogoDisplay />
				</div>
				{children[0]}
			</aside>
			<main className="main-content relative h-screen overflow-auto scrollbar-hidden lg:pl-[250px] xl:pl-[300px]">
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
				className="fixed right-4 top-4 lg:hidden"
				onClick={() => setOpen(true)}
			>
				<HamburgerMenuIcon />
			</Button>
			{isOpen && (
				<aside className="fixed z-50 h-screen w-screen bg-neutral-950 pt-10 lg:hidden">
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
