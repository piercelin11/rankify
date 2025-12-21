import { Suspense } from 'react';
import { auth, getUserSession } from '../../../auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SimpleSidebar } from '@/components/sidebar/SimpleSidebar';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { getRecentLoggedArtists } from '@/db/artist';
import ScrollIsolationWrapper from '@/components/layout/ScrollIsolationWrapper';
import SidebarSkeleton from '@/components/layout/SidebarSkeleton';

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	// 獲取 session (可能為 null)
	const session = await auth();
	const user = session?.user || null;

	return (
		<SidebarProvider defaultOpen={true}>
			{/* Global Header */}
			<GlobalHeader user={user} />

			{/* Sidebar - Desktop only */}
			<Suspense fallback={<SidebarSkeleton />}>
				<SidebarWithData />
			</Suspense>

			{/* Main Content */}
			<SidebarInset className="h-full overflow-hidden pt-16 pb-16 md:pb-0">
				{/* pt-16: Header 高度, pb-16: Mobile 底部導航高度 (僅 Mobile) */}
				{children}
			</SidebarInset>

			{/* Mobile 底部導航 */}
			<MobileBottomNav user={user} />
		</SidebarProvider>
	);
}

/**
 * Sidebar 資料獲取邏輯
 *
 * 拆分原因:
 * - getUserSession() 不能加 use cache (依賴 headers())
 * - 必須包在 Suspense 裡才能符合 Next.js 15 的要求
 * - getRecentLoggedArtists() 可以快取，已加上 use cache
 */
async function SidebarWithData() {
	const user = await getUserSession(); // 動態資料，不快取
	const loggedArtists = await getRecentLoggedArtists({ userId: user.id }); // 可快取

	return (
		<ScrollIsolationWrapper>
			<SimpleSidebar user={user} artists={loggedArtists} />
		</ScrollIsolationWrapper>
	);
}
