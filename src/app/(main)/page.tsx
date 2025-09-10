import ContentWrapper from "@/components/layout/ContentWrapper";
import getUnloggedArtists from "@/lib/database/user/getUnloggedArtists";
import { getUserSession } from "@/../auth";
import GalleryItem from "@/components/presentation/GalleryItem";
import GalleryWrapper from "@/components/presentation/GalleryWrapper";

export default async function HomePage() {
	const { id: userId } = await getUserSession();
	const unloggedArtists = await getUnloggedArtists({ userId });
	

	return (
		<ContentWrapper>
			<div className="space-y-8">
				<h2>Artists you might like</h2>
				<GalleryWrapper>
					{unloggedArtists.map((artist) => (
						<GalleryItem
							key={artist.id}
							href={`/artist/${artist.id}/overview`}
							img={artist.img}
							title={artist.name}
							subTitle="Artist"
						/>
					))}
				</GalleryWrapper>
			</div>
		</ContentWrapper>
	);
}
