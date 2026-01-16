import { Skeleton } from '@/components/ui/skeleton';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

/**
 * Sidebar Loading 狀態
 *
 * 當 getCurrentSession 和 getRecentLoggedArtists 正在載入時顯示
 */
export default function SidebarSkeleton() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background p-4">
      {/* 使用者資訊 Skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* 選單項目 Skeleton */}
      <SidebarMenu>
        {[...Array(5)].map((_, i) => (
          <SidebarMenuItem key={i}>
            <Skeleton className="h-10 w-full" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      {/* 歌手清單 Skeleton */}
      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
