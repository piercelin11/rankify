import { getUserSession } from "@/../auth";
import { getUserDashboardStats } from "@/services/home/getUserDashboardStats";
import { getUserDrafts } from "@/services/home/getUserDrafts";
import { getUserHistory } from "@/services/home/getUserHistory";
import { getHeroItem } from "@/services/home/getHeroItem";
import { getDiscoveryArtists } from "@/services/home/getDiscoveryArtists";
import DashboardSection from "@/features/home/components/DashboardSection";
import GlobalSearch from "@/features/home/components/GlobalSearch";
import HeroSection from "@/features/home/components/HeroSection";
import DraftsSection from "@/features/home/components/DraftsSection";
import HistorySection from "@/features/home/components/HistorySection";
import DiscoverySection from "@/features/home/components/DiscoverySection";

export default async function HomePage() {
	const user = await getUserSession();
	const userId = user.id;

	// 並行查詢所有資料
	const [stats, drafts, history, hero, discovery] = await Promise.all([
		getUserDashboardStats({ userId }),
		getUserDrafts({ userId }),
		getUserHistory({ userId, limit: 15 }),
		getHeroItem({ userId }),
		getDiscoveryArtists({ userId }),
	]);

	// Hero 過濾邏輯: 避免重複顯示
	let filteredDrafts = drafts;
	let filteredHistory = history;

	if (hero) {
		const { type, data } = hero;
		const submissionId = data.submissionId;

		if (type === "resume" && submissionId) {
			filteredDrafts = drafts.filter((d) => d.id !== submissionId);
		} else if (type === "achievement" && submissionId) {
			filteredHistory = history.filter((h) => h.id !== submissionId);
		}
	}

	return (
		<div className="space-y-14 p-content">
			<div className="mx-auto max-w-2xl">
				<GlobalSearch />
			</div>
			<div className="space-y-4">
				<HeroSection hero={hero} />
				<DashboardSection stats={stats} />
			</div>
			<div className="space-y-14">
				{filteredDrafts.length > 0 && <DraftsSection drafts={filteredDrafts} />}

				{filteredHistory.length > 0 && (
					<HistorySection history={filteredHistory} />
				)}

				<DiscoverySection artists={discovery} />
			</div>
		</div>
	);
}
