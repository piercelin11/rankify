
import React from "react";

type SidebarLayoutProps = {
	children: [React.ReactNode, React.ReactNode];
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
	return (
		<>
			<div className="fixed z-10 h-screen w-[80px] border-r border-zinc-850 md:w-[300px] 2xl:w-[350px]">
				{children[0]}
			</div>
			<div className="main-content h-screen overflow-auto scrollbar-hidden pl-[80px] md:pl-[300px] 2xl:pl-[350px]">
				{children[1]}
			</div>
		</>
	);
}

export function SettingsSidebarLayout({ children }: SidebarLayoutProps) {
	return (
		<div className="h-screen">
			<div className="fixed h-screen w-[80px] md:w-[300px] 2xl:w-[350px]">
				{children[0]}
			</div>
			<div className="pl-[80px] md:pl-[300px] 2xl:pl-[350px]">
				{children[1]}
			</div>
		</div>
	);
}
