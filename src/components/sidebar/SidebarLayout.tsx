import React from "react";

type SidebarLayoutProps = {
	children: [React.ReactNode, React.ReactNode];
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
	return (
		<div className="min-h-screen">
			<div className="fixed min-h-screen w-[80px] border-r border-zinc-850 md:w-[300px] 2xl:w-[350px]">
				{children[0]}
			</div>
			<div className="pl-[80px] md:pl-[300px] 2xl:pl-[350px]">{children[1]}</div>
		</div>
	);
}
