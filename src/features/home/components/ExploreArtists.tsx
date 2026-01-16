import { getPopularArtists } from "@/services/home/getPopularArtists";
import DiscoverySection from "./DiscoverySection";

export default async function ExploreArtists() {
	const popularArtists = await getPopularArtists();

	if (popularArtists.length === 0) {
		return null;
	}

	return (
		<DiscoverySection
			data={popularArtists}
			title="Find Your Artist"
			type="ARTIST"
		/>
	);
}
