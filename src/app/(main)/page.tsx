import { getUserSession } from "@/../auth";
import { getUserDashboardStats } from "@/services/home/getUserDashboardStats";
import { getUserDrafts } from "@/services/home/getUserDrafts";
import { getUserHistory } from "@/services/home/getUserHistory";
import { getTrendingArtists } from "@/services/home/getTrendingArtists";
import DashboardSection from "@/features/home/components/DashboardSection";
import GlobalSearch from "@/features/home/components/GlobalSearch";
import DraftsSection from "@/features/home/components/DraftsSection";
import HistorySection from "@/features/home/components/HistorySection";
import TrendingSection from "@/features/home/components/TrendingSection";

export default async function HomePage() {
	// ✅ Phase 1: 使用 getUserSession (middleware 保證使用者已登入)
	const user = await getUserSession();
	const userId = user.id;

	// 並行查詢所有資料
	const [stats, drafts, history, trending] = await Promise.all([
		getUserDashboardStats({ userId }),
		getUserDrafts({ userId }),
		getUserHistory({ userId, limit: 5 }),
		getTrendingArtists(),
	]);

	return (
		<div className="space-y-12 p-content">
			<DashboardSection stats={stats} />

			<div className="mx-auto max-w-2xl">
				<GlobalSearch />
			</div>
			{drafts.length > 0 && <DraftsSection drafts={drafts} />}

			{history.length > 0 && <HistorySection history={history} />}

			<TrendingSection artists={trending} />
		</div>
	);
}
