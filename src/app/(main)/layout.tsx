import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Suspense } from "react";
import { getSession } from "../../../auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SimpleSidebar } from "@/components/sidebar/SimpleSidebar";
import { getRecentLoggedArtists } from "@/db/artist";
import ScrollIsolationWrapper from "@/components/layout/ScrollIsolationWrapper";
import SidebarSkeleton from "@/components/layout/SidebarSkeleton";
import { GuestSidebar } from "@/components/sidebar/GuestSidebar";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const user = await getSession();

	let sidebar: React.ReactNode;
	if (!user) {
		sidebar = <GuestSidebar />;
	} else {
		const loggedArtists = await getRecentLoggedArtists({ userId: user.id });
		sidebar = <SimpleSidebar user={user} artists={loggedArtists} />;
	}

	return (
		<SidebarProvider defaultOpen={true}>
			{/* Global Header */}
			<GlobalHeader user={user} />

			{/* Sidebar - Desktop only */}
			<Suspense fallback={<SidebarSkeleton />}>
				<ScrollIsolationWrapper>
					{sidebar}
				</ScrollIsolationWrapper>
			</Suspense>

			{/* Main Content */}
			<SidebarInset>
				<div data-scroll-container className="h-full overflow-y-auto overflow-x-hidden">
					{children}
				</div>
			</SidebarInset>

			{/* Mobile 底部導航 */}
			<MobileBottomNav user={user} />
		</SidebarProvider>
	);
}