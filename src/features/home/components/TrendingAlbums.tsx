import { getTrendingAlbums } from "@/services/home/getTrendingAlbums";
import DiscoverySection from "./DiscoverySection";

export default async function TrendingAlbums() {
	const trendingAlbums = await getTrendingAlbums();

	if (trendingAlbums.length === 0) {
		return null;
	}

	return (
		<DiscoverySection
			data={trendingAlbums}
			title="Start Ranking: Trending Albums"
			type="ALBUM"
		/>
	);
}
