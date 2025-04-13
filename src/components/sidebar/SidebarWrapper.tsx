"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Button from "../ui/Button";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import LogoDisplay from "./LogoDisplay";
import { usePathname } from "next/navigation";
import { throttle } from "@/lib/utils/helper";

type SidebarWrapperProps = {
	children: [React.ReactNode, React.ReactNode];
};

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
	const [isMobile, setMobile] = useState(false);

	useEffect(() => {
		const updateSize = throttle(() => {
			setMobile(window.innerWidth <= 1024);
		}, 200);
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return (
		<>
			{isMobile && <MobileSidebarWrapper>{children[0]}</MobileSidebarWrapper>}

			<aside className="fixed z-10 hidden h-screen border-r border-zinc-850 p-4 lg:block lg:w-[300px]">
				<div className="py-5">
					<LogoDisplay />
				</div>
				{children[0]}
			</aside>
			<main className="h-screen overflow-auto scrollbar-hidden lg:pl-[300px]">
				{children[1]}
			</main>
		</>
	);
}

export function SettingsSidebarWrapper({ children }: SidebarWrapperProps) {
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

function MobileSidebarWrapper({ children }: { children: ReactNode }) {
	const [isOpen, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	return (
		<>
			<Button
				variant="transparent"
				className="fixed right-4 top-4 lg:hidden"
				onClick={() => setOpen(true)}
			>
				<HamburgerMenuIcon />
			</Button>
			{isOpen && (
				<aside className="fixed z-50 h-screen w-screen bg-zinc-950 pt-10 lg:hidden">
					<Button
						variant="transparent"
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
