import React from "react";

type SidebarLayoutProps = {
	children: [React.ReactNode, React.ReactNode];
};

export default function SidebarLayout({ children }: SidebarLayoutProps) {
	return (
		<div className="grid min-h-screen grid-cols-[350px_1fr] lg:grid-cols-[280px_1fr]">
			<div className="border-r border-zinc-800">{children[0]}</div>
			<div>{children[1]}</div>
		</div>
	);
}
