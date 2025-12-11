import { Suspense } from 'react';
import { getUserSession } from '../../../auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SimpleSidebar } from '@/components/sidebar/SimpleSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { getRecentLoggedArtists } from '@/db/artist';
import ScrollIsolationWrapper from '@/components/layout/ScrollIsolationWrapper';
import SidebarSkeleton from '@/components/layout/SidebarSkeleton';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* ========== 用 Suspense 包裹 Sidebar ========== */}
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWithData />
      </Suspense>
      {/* ========== Suspense 結束 ========== */}

      <SidebarInset className="h-full overflow-hidden">
        <AppHeader />
        {children}
      </SidebarInset>
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
