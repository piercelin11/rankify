import { Suspense } from "react";
import { getUserSession } from "../../../auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SimpleSidebar } from "@/components/sidebar/SimpleSidebar";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getRecentLoggedArtists } from "@/db/artist";
import ScrollIsolationWrapper from "@/components/layout/ScrollIsolationWrapper";
import SidebarSkeleton from "@/components/layout/SidebarSkeleton";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const user = await getUserSession(); // 動態資料，不快取
	const loggedArtists = await getRecentLoggedArtists({ userId: user.id }); // 可快取

	return (
		<SidebarProvider defaultOpen={true}>
			{/* Global Header */}
			<GlobalHeader user={user} />

			{/* Sidebar - Desktop only */}
			<Suspense fallback={<SidebarSkeleton />}>
				<ScrollIsolationWrapper>
					<SimpleSidebar user={user} artists={loggedArtists} />
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
