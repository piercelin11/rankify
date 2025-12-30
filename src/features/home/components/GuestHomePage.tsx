import { getHeroSpotlight } from "@/services/home/getHeroSpotlight";
import HeroSpotlight from "./HeroSpotlight";
import TrendingAlbums from "./TrendingAlbums";
import ExploreArtists from "./ExploreArtists";
import CommunityPicks from "./CommunityPicks";

export default async function GuestHomePage() {
	const heroData = await getHeroSpotlight();

	return (
		<div className="p-content space-y-14">
			{/* Hero Section */}
			{heroData && <HeroSpotlight data={heroData} />}

			{/* Trending Albums */}
			<TrendingAlbums />

			{/* Explore Artists */}
			<ExploreArtists />

			{/* Community Picks */}
			<CommunityPicks />
		</div>
	);
}
