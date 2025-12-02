import type { TrendingArtistType } from "@/types/home";
import GalleryWrapper from "@/components/presentation/GalleryWrapper";
import GalleryItem from "@/components/presentation/GalleryItem";

type TrendingSectionProps = {
	artists: TrendingArtistType[];
};

export default function TrendingSection({ artists }: TrendingSectionProps) {
	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-bold">Trending Artists</h2>

			<GalleryWrapper>
				{artists.map((artist) => (
					<GalleryItem
						key={artist.id}
						href={`/artist/${artist.id}/my-stats`}
						img={artist.img}
						title={artist.name}
						subTitle="Artist"
					/>
				))}
			</GalleryWrapper>
		</section>
	);
}
