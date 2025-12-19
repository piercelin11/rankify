/* type GuestHomePageProps = {

} */

import { getPopularArtists } from "@/services/home/getPopularArtists";
import DiscoverySection from "./DiscoverySection";
import { getPopularAlbums } from "@/services/home/getPopularAlbums";

export default async function GuestHomePage() {
	const [popularArtists, popularAlbums] = await Promise.all([
		getPopularArtists(),
		getPopularAlbums(),
	]);
	return (
		<div className="p-content space-y-14">
             <DiscoverySection
				data={popularAlbums}
				title="Popular Albums"
				type="ALBUM"
			/>
			<DiscoverySection
				data={popularArtists}
				title="Popular Artists"
				type="ARTIST"
			/>
		</div>
	);
}
