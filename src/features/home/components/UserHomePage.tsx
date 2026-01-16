import { getUserDashboardStats } from "@/services/home/getUserDashboardStats";
import { getUserDrafts } from "@/services/home/getUserDrafts";
import { getUserHistory } from "@/services/home/getUserHistory";
import { getHeroItem } from "@/services/home/getHeroItem";
import { getDiscoveryArtists } from "@/services/home/getDiscoveryArtists";
import DashboardSection from "@/features/home/components/DashboardSection";
import HeroSection from "@/features/home/components/HeroSection";
import DraftsSection from "@/features/home/components/DraftsSection";
import HistorySection from "@/features/home/components/HistorySection";
import DiscoverySection from "@/features/home/components/DiscoverySection";

type UserHomePageProps = {
	userId: string;
};

export default async function UserHomePage({ userId }: UserHomePageProps) {
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
		<div className="p-content space-y-14">
			<div className="space-y-4">
				<HeroSection hero={hero} />
				<DashboardSection stats={stats} />
			</div>
			<div className="space-y-14">
				{filteredDrafts.length > 0 && <DraftsSection drafts={filteredDrafts} />}

				{filteredHistory.length > 0 && (
					<HistorySection history={filteredHistory} />
				)}

				<DiscoverySection data={discovery}  title="Discover New Artists" type="ARTIST" />
			</div>
		</div>
	);
}
